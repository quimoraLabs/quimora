import mongoose from "mongoose";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";

export const assertUserExists = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const user = await User.findById(userId);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user;
};

export const assertQuizExists = async (quizId, userId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  if (
    (quiz.createdBy.toString() !== userId && user.role !== "admin" )
  ) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }
  return quiz;
};

export const assertQuestionExists = async (quiz, questionId) => {
  const question = quiz.questions.id(questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  return { question };
};
