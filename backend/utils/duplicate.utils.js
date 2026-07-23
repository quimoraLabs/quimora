import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";


/**
 * Checks for a duplicate question text within the scope of a specific quiz.
 */
export const isDuplicateQuestion = async (quizId, questionText, excludeId = null) => {
  const query = {
    quizId,
    questionText: questionText?.trim() || "",
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const exists = await Question.exists(query).collation({ locale: 'en', strength: 2 });
  return !!exists;
};

/**
 * Checks for a duplicate quiz title for a specific user.
 */
export const isDuplicateQuiz = async (title, createdBy, excludeId = null) => {
  const query = {
    title: title?.trim() || "",
    createdBy,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const exists = await Quiz.exists(query).collation({ locale: 'en', strength: 2 });
  return !!exists;
};
