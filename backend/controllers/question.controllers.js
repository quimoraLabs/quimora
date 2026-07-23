import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
// import User from "../models/user.model.js";
import { isDuplicateQuestion } from "../utils/duplicate.utils.js";

import {
  assertQuestionExists,
  assertUserExists,
  assertQuizExists,
} from "../utils/assertion.utils.js";
import { getQuizAccess } from "../utils/getQuizAccess.utils.js";
import Question from "../models/question.model.js";
import { hasFieldChanges } from "../utils/helper.utils.js";

// Create single question
export const createQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questionText, marks, difficulty, options } = req.body;
    const userId = req.auth?.userId;

    const quiz = await assertQuizExists(quizId);
    if (quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this quiz." });
    }

    const isDuplicate = await isDuplicateQuestion(quizId, questionText);
    if (isDuplicate) {
      return res.status(409).json({ success: false, message: "Conflict: Duplicate question structure text exists." });
    }

    const question = await Question.create({
      quizId,
      questionText,
      marks,
      difficulty,
      options,
    });

    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: question._id },
    });

    res.status(201).json({ success: true, message: "Question created successfully", data: question });
  } catch (error) {
    next(error);
  }
};

// Create bulk questions
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;
    const userId = req.auth?.userId;

    // Bug fix #4: Add limit
    if (questions.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Maximum 500 questions allowed per request"
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Missing or empty questions array payload." });
    }

    const quiz = await assertQuizExists(quizId);
    if (quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this quiz." });
    }

    // Bug fix #1 & #2: Single duplicate check + validate options
    const cleanedQuestions = [];
    for (const q of questions) {
      // Bug fix #2: Validate options
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        continue; // Skip invalid questions
      }

      cleanedQuestions.push({
        quizId,
        questionText: q.questionText,
        marks: q.marks || 1,
        difficulty: q.difficulty || "medium",
        options: q.options,
      });
    }

    // Bug fix #1: Single duplicate check (removed the first one)
    const existingQuestions = await Question.find({
      quizId,
      questionText: { $in: cleanedQuestions.map(q => q.questionText) }
    }).select('questionText');

    const existingTexts = new Set(existingQuestions.map(q => q.questionText));
    const uniqueQuestions = cleanedQuestions.filter(q => !existingTexts.has(q.questionText));

    if (uniqueQuestions.length === 0) {
      return res.status(409).json({ success: false, message: "All provided questions are duplicates." });
    }

    // Bug fix #3: Handle update failure
    const createdQuestions = await Question.insertMany(uniqueQuestions);
    const createdQuestionIds = createdQuestions.map(q => q._id);

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: { $each: createdQuestionIds } },
    });

    // If quiz update fails, clean up orphaned questions
    if (!updatedQuiz) {
      await Question.deleteMany({ _id: { $in: createdQuestionIds } });
      return res.status(500).json({ success: false, message: "Failed to update quiz" });
    }

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} of ${questions.length} questions imported successfully`,
      data: createdQuestions
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const { quizId, questionId } = req.params;
    const userId = req.auth?.userId;

    await getQuizAccess(quizId, userId);

    const question = await Question.findOne({ _id: questionId, quizId }).select(
      "+options.isCorrect"
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// Get all questions for a quiz with Pagination Protection
export const getQuizQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    await assertQuizExists(quizId, "false");

    const totalQuestions = await Question.countDocuments({ quizId });
    const questions = await Question.find({ quizId })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination: {
        totalItems: totalQuestions,
        totalPages: Math.ceil(totalQuestions / limit),
        currentPage: page,
        limit,
      },
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// Update standalone question
export const updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { questionText, marks, difficulty, options } = req.body;
    const userId = req.auth.userId.toString();

    // 1. Fetch & Ownership Check
    const question = await assertQuestionExists(questionId);
    const quiz = await assertQuizExists(question.quizId);

    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // 2. Extract incoming fields
    const updates = { questionText, marks, difficulty, options };

    // 3. CLEAN CHECK using Utility ⚡
    if (!hasFieldChanges(updates, question)) {
      return res.status(400).json({ error: "No changes detected in the provided data" });
    }

    // 4. Duplicate Question Check (Only if text changed)
    if (questionText && questionText.trim() !== question.questionText) {
      const isDuplicate = await isDuplicateQuestion(question.quizId, questionText, questionId);
      if (isDuplicate) {
        return res.status(409).json({ error: "Duplicate question text exists in this quiz" });
      }
    }

    // 5. Apply updates & Save
    Object.assign(question, updates);
    await question.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// Delete single question
export const deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const userId = req.auth?.userId;

    const question = await assertQuestionExists(questionId);
    const quiz = await assertQuizExists(question.quizId);

    if (quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access path." });
    }

    await Question.findByIdAndDelete(questionId);
    await Quiz.findByIdAndUpdate(question.quizId, {
      $pullAll: { questions: [question._id] },
    });
    res.status(200).json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteMultipleQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth?.userId;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or empty questionIds array.",
      });
    }

    await getQuizAccess(quizId, userId);

    const normalizedRequested = questionIds.map((id) => id.toString());

    const questionsInQuiz = await Question.find({
      _id: { $in: normalizedRequested },
      quizId,
    }).select("_id");

    const idsToDelete = questionsInQuiz.map((q) => q._id);
    const validSet = new Set(idsToDelete.map((id) => id.toString()));
    const invalidIds = normalizedRequested.filter((id) => !validSet.has(id));

    if (idsToDelete.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question IDs found in this quiz.",
        invalidIds,
      });
    }

    await Question.deleteMany({ _id: { $in: idsToDelete }, quizId });

    await Quiz.findByIdAndUpdate(quizId, {
      $pullAll: { questions: idsToDelete },
    });

    res.status(200).json({
      success: true,
      message: "Questions deleted successfully",
      deletedQuestionIds: idsToDelete.map((id) => id.toString()),
      ...(invalidIds.length > 0 && { invalidIds }),
    });
  } catch (error) {
    next(error);
  }
};