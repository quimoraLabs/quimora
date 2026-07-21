import mongoose from "mongoose";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";

export const assertUserExists = async (userId, selectFields = "") => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  if (selectFields === "false") {
    const exists = await User.exists({ _id: userId });
    if (!exists) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return null;
  }
  const user = await User.findById(userId).select(selectFields);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const assertQuizExists = async (quizId, selectFields = "") => {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }
  if (selectFields === "false") {
    const exists = await Quiz.exists({ _id: quizId });
    if (!exists) {
      const err = new Error("Quiz not found");
      err.statusCode = 404;
      throw err;
    }
    return null;
  }
  const quiz = await Quiz.findById(quizId).select(selectFields);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }
  return quiz;
};

export const assertQuestionExists = async (questionId) => {
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    const err = new Error("Question not found");
    err.statusCode = 404;
    throw err;
  }
  const question = await Question.findById(questionId).select("+options.isCorrect");
  if (!question) {
    const err = new Error("Question not found");
    err.statusCode = 404;
    throw err;
  }
  return question;
};