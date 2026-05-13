import mongoose from "mongoose";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";


/**
 * Validates user existence and fetches specific document fields safely.
 * @param {String} userId - The MongoDB HexString ID of the user.
 * @param {String} selectFields - Space-separated fields to fetch. Pass "false" to skip data fetching and only verify existence.
 * @returns {Promise<Object|null>} Returns User document, partial object, or null depending on options.
 * @throws {Error} 404 Error if user does not exist or ID format is invalid.
 */

export const assertUserExists = async (userId, selectFields = "") => {
  // 1. Validate the structure of the incoming MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // 2. CASE 1: Optimized verification check (Checks index without loading full memory state)
  if (selectFields === "false") {
    const exists = await User.exists({ _id: userId });
    if (!exists) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return null; // Safe exit point: Verification successful with zero memory overhead
  }

  // 3. CASE 2: Selective/Full data retrieval configuration
  let query = User.findById(userId);
  if (selectFields) {
    query = query.select(selectFields); // Applies targeted filtering to avoid accidental document stripping on save
  }

  const user = await query;
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user;
};

export const assertQuizExists = async (quizId, selectFields = "") => {
  // 1. Defensive structural validation for the ID
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // 2. CASE 1: High-performance existence check (No data pull)
  if (selectFields === "false") {
    const exists = await Quiz.exists({ _id: quizId });
    if (!exists) {
      const err = new Error("Quiz not found");
      err.statusCode = 404;
      throw err;
    }
    return null;
  }

  // 3. CASE 2: Full or selective retrieval
  let query = Quiz.findById(quizId);
  if (selectFields) {
    query = query.select(selectFields);
  }

  const quiz = await query;
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  return quiz;
};


/**
 * Validates and retrieves a specific sub-document question from a parent quiz instance.
 * @param {Object} quiz - The instantiated Mongoose Quiz document.
 * @param {String} questionId - The MongoDB HexString ID of the target question sub-document.
 * @returns {Object} The isolated question sub-document object.
 * @throws {Error} 400 Error if array hydration is missing, or 404 Error if question does not exist.
 */

export const assertQuestionExists = async (quiz, questionId) => {
  // 1. Guard clause: Ensure the questions sub-document array was loaded in the parent query
  if (!quiz || !quiz.questions) {
    const err = new Error("Quiz queries must hydrate and include the questions array path");
    err.statusCode = 400;
    throw err;
  }

  // 2. Locate the specific sub-document using the native Mongoose array lookup method
  const question = quiz.questions.id(questionId);
  
  if (!question) {
    const err = new Error("Question not found");
    err.statusCode = 404;
    throw err;
  }

  return question;
};
