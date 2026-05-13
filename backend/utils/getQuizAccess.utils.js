
import { assertUserExists, assertQuizExists } from "../utils/assertion.utils.js"

/**
 * Validates user existence and verifies quiz ownership authorization.
 * @param {String} quizId - The MongoDB ID of the target quiz.
 * @param {String} userId - The MongoDB ID of the requesting user.
 * @returns {Promise<Object>} Returns the fully validated Quiz document if authorized.
 * @throws {Error} 404 if user/quiz is not found, or 403 if unauthorized.
 */

export const getQuizAccess = async (quizId, userId) => {
  // 1. Check user existence with zero memory overhead
  await assertUserExists(userId, "false");

  // 2. Fetch the full quiz document safely using the new assertion helper
  const quiz = await assertQuizExists(quizId);

  // 3. Evaluate ownership boundaries
  if (!quiz.createdBy.equals(userId)) {
    const err = new Error("Unauthorized access to this resource");
    err.statusCode = 403;
    throw err;
  }

  return quiz;
};