import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import mongoose from "mongoose";

export const getQuizAccess = async ({ userId, quizId }) => {

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  // Check if quizId is a valid ObjectId is already done in the route using validateObjectId middleware

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  if (quiz.createdBy.toString() !== userId) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }

  return { user, quiz };
};