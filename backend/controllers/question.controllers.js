import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import { isDuplicateQuestion } from "../utils/question.utils.js";

import {
  assertQuestionExists,
  assertUserExists,
} from "../utils/assertion.utils.js";
import { getQuizAccess } from "../utils/getQuizAccess.utils.js";

export const createQuestion = async (req, res) => {
  const data = req.body;
  const { quizId } = req.params;
  const rawUserId = req.auth?.userId;
  
  try {
    // 1. Force convert explicit string mapping to match data layer
    const userIdStr = rawUserId ? rawUserId.toString() : null;
    
    // console.log("--- SAFELY CHECKING QUERY PARAMETERS ---");
    // console.log("Quiz ID:", quizId);
    // console.log("User ID String:", userIdStr);
    
    // 2. Dynamic query using $or condition to handle both potential field names ('userId' or 'createdBy')
    const quiz = await Quiz.findOne({
      _id: quizId,
      $or: [
        { userId: userIdStr },
        { createdBy: userIdStr }
      ]
    }).select("+questions.options.isCorrect");

    // console.log("Fetched Quiz Document Instance:", quiz);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz instance not found or access denied. Ensure field mappings match." 
      });
    }

    // 3. Validate structural requirements for standard multiple-choice configurations
    if (data.options && Array.isArray(data.options)) {
      if (data.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: "Validation Error: A standard multiple-choice question must contain exactly 4 options."
        });
      }

      const hasCorrect = data.options.some(opt => opt.isCorrect === true || opt.isCorrect === "true");
      if (!hasCorrect) {
        return res.status(400).json({
          success: false,
          message: "Validation Error: At least one response alternative must be specified as correct."
        });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing required parameter: options array." });
    }

    // Filter incoming request entity to restrict mutation to permitted schema paths
    const allowedFields = ["questionText", "marks", "difficulty", "options"];
    const cleanData = {};
    Object.keys(data).forEach((field) => {
      if (allowedFields.includes(field)) {
        cleanData[field] = data[field];
      }
    });

    // 4. Safe helper verification check before invoking external layout logic
    let duplicateDetected = false;
    if (typeof isDuplicateQuestion === "function") {
      duplicateDetected = isDuplicateQuestion(quiz.questions, cleanData);
    }

    if (duplicateDetected) {
      return res.status(409).json({ message: "Conflict detected: Duplicate question structure exists." });
    }

    // Mutate internal document array hierarchy and invoke atomic persistence layer lifecycle
    quiz.questions.push(cleanData);
    await quiz.save();

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: quiz.questions[quiz.questions.length - 1], 
    });
    
  } catch (error) {
    console.error("Critical Server Catch Executed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  const { quizId, questionId } = req.params;
  try {
    const quiz = await getQuizAccess(quizId, req.auth.userId);
    const question = quiz.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const quiz = await getQuizAccess(req.params.quizId, req.auth.userId);
    res.status(200).json({ success: true, questions: quiz.questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  const data = req.body;
  const { quizId, questionId } = req.params;
  const userId = req.auth.userId;

  try {
    // 1. Authorization & Existence checks
    const quiz = await getQuizAccess(quizId, userId);
    assertQuestionExists(quiz, questionId);

    // 2. Purely filter only the main fields
    const allowedFields = ["questionText", "marks", "difficulty"];
    const cleanData = {};
    let extraFieldsIgnored = false;

    Object.keys(data).forEach((field) => {
      if (allowedFields.includes(field)) {
        cleanData[field] = data[field];
      } else {
        extraFieldsIgnored = true;
      }
    });

    // 3. Duplicate text validation
    if (isDuplicateQuestion(quiz.questions, cleanData, questionId)) {
      return res.status(409).json({ message: "Duplicate question" });
    }

    // 4. 🌟 THE REAL ANTIDOTE: Map explicitly to avoid path collisions
    // Map each field explicitly so Mongoose can apply the update path correctly.
    const updatePayload = {};
    Object.keys(cleanData).forEach((key) => {
      updatePayload[`questions.$.${key}`] = cleanData[key];
    });

    // Atomic database update using exact field mapping
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { _id: quizId, "questions._id": questionId },
      { $set: updatePayload }, // 👈 This prevents conflicts in this update path.
      { returnDocument: 'after', runValidators: false }
    );

    const updatedQuestion = updatedQuiz.questions.find(
      (q) => q._id.toString() === questionId.toString()
    );

    // 5. Success Response
    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      ...(extraFieldsIgnored && { warning: "Unallowed or extra fields were ignored safely." }),
      question: updatedQuestion,
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  const { quizId, questionId } = req.params;
  const userId = req.auth.userId;

  try {
    // 1. Authorization & Existence checks
    const quiz = await getQuizAccess(quizId, userId);
    assertQuestionExists(quiz, questionId);

    // 2. 🌟 ATOMIC DELETE: Direct Database Level Pull (No .save() / No Hooks)
    await Quiz.findOneAndUpdate(
      { _id: quizId },
      { $pull: { questions: { _id: questionId } } },
      {returnDocument: 'after'}
    );

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      deletedQuestionId: questionId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMultipleQuestions = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.auth.userId;
  const { questionIds } = req.body;

  try {
    // 1. Authorization check
    const quiz = await getQuizAccess(quizId, userId);

    // 2. Filter valid IDs to delete from the array
    const existingIds = quiz.questions.map((q) => q._id.toString());
    const idsToDelete = questionIds.filter((id) => existingIds.includes(id));
    const invalidIds = questionIds.filter((id) => !existingIds.includes(id));

    if (idsToDelete.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question IDs found in this quiz.",
        invalidIds,
      });
    }

    // 3. 🌟 ATOMIC BULK DELETE: Pull all matching IDs in one shot ($pullAll)
    await Quiz.findOneAndUpdate(
      { _id: quizId },
      { $pull: { questions: { _id: { $in: idsToDelete } } } },
      {returnDocument: 'after'}
    );

    res.status(200).json({
      success: true,
      message: "Questions deleted successfully",
      deletedQuestionIds: idsToDelete,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};