import mongoose from "mongoose";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";

export const assertUserExists = async (userId) => {
  console.log(userId);
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

export const assertQuestionExists = async (quiz, questionId) => {
  const question = await quiz.questions.id(questionId);
  if (!question) {
    const err = new Error("Question not found");
    err.statusCode = 404;
    throw err;
  }
  return question;
};
