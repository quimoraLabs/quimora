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
  try {
    const data = req.body;

    const quiz = await getQuizAccess(req.params.quizId, req.auth.userId);
    // console.log(user);
    if (isDuplicateQuestion(quiz.questions, data)) {
      return res.status(409).json({ message: "Duplicate question" });
    }

    quiz.questions.push({
      ...data,
    });
    await quiz.save();
    res.status(201).json({
      success: true,
      message: "question created successfully",
      quiz: quiz.questions[quiz.questions.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const quiz = await getQuizAccess(req.params.quizId, req.auth.userId);
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
  const quizId = req.params.quizId;
  const questionId = req.params.questionId;
  const userId = req.auth.userId;

  try {
    const quiz = await getQuizAccess(quizId, userId);

    const question = assertQuestionExists(quiz, questionId);

    console.log(question);

    if (isDuplicateQuestion(quiz.questions, data)) {
      return res.status(409).json({ message: "Duplicate question" });
    }

    // question.set(data);
    // await quiz.save();
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res, next) => {
  const data = req.body;
  const quizId = req.params.quizId;
  const questionId = req.params.questionId;
  const userId = req.auth.userId;
  try {
    const quiz = await getQuizAccess(quizId, userId);
    const question = await assertQuestionExists(quiz, questionId);
    console.log(question);
    quiz.questions.pull({ _id: questionId });
    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      deletedQuestionId: questionId,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMultipleQuestions = async (req, res, next) => {
  const data = req.body;
  const quizId = req.params.quizId;
  const userId = req.auth.userId;
  const { questionIds } = req.body;
  try {
    const quiz = await getQuizAccess(quizId, userId);

    const existingIds = quiz.questions.map((q) => q._id.toString());
    const idsToDelete = questionIds.filter(id => existingIds.includes(id));
    const invalidIds = questionIds.filter((id) => !existingIds.includes(id));

    if (idsToDelete.length===0) {
      return res.status(400).json({
        success: false,
        message: "No valid question IDs found in this quiz.",
        invalidIds,
      });
    }

    quiz.questions = quiz.questions.filter(
      (q) => !idsToDelete.includes(q._id.toString()),
    );


    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Questions deleted successfully",
      deletedQuestionIds: idsToDelete,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
