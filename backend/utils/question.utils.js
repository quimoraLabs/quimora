import Question from "../models/question.model.js";

/**
 * Checks for a duplicate question text within the scope of a specific quiz.
 */
export const isDuplicateQuestion = async (quizId, questionText, excludeId = null) => {
  const query = {
    quizId,
    questionText: { $regex: new RegExp(`^${questionText?.trim() || ""}$`, "i") },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const exists = await Question.exists(query);
  return !!exists;
};