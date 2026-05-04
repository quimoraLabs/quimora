import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import { isDuplicateQuestion } from "../utils/question.utils.js";
import { getQuizAccess } from "../utils/getQuizAccess.utils.js";

export const createQuestion = async (req, res) => {
  const data = req.body;
  const quizId = req.params.quizId;
  const userId = req.auth.userId;

  try {
    const { quiz } = await getQuizAccess({
      userId,
      quizId,
    });

    if (isDuplicateQuestion(quiz.questions, data)) {
      return res.status(409).json({ message: "Duplicate question" });
    }

    quiz.questions.push({
      ...data,
      createdBy: userId,
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
    const { quiz } = await getQuizAccess({
      userId: req.auth.userId,
      quizId: req.params.quizId,
    });
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
  const quizId = req.params.quizId;
  try {
    const { quiz } = await getQuizAccess({
      userId: req.auth.userId,
      quizId,
    });
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
    const { quiz } = await getQuizAccess({
      userId,
      quizId,
    });

    const question = quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (isDuplicateQuestion(quiz.questions, data)) {
      return res.status(409).json({ message: "Duplicate question" });
    }

    question.set(data);
    await quiz.save();
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
    const { quiz } = await getQuizAccess({
      userId,
      quizId,
    });
    const question = quiz.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.deleteOne();
    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      deletedQuestion: question,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMultipleQuestions = async (req, res, next) => {
  const data = req.body;
  const quizId = req.params.quizId;
  const userId = req.auth.userId;
  const {questionIds} = req.body;
  try {
    const { quiz } = await getQuizAccess({
      userId,
      quizId,
    });

   quiz.questions = quiz.questions.filter(
    (q)=> !questionIds.includes(q._id.toString())
   );

    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Questions deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
