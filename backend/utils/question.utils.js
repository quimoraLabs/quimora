export const isDuplicateQuestion = (questions, incomingQuestion, excludeId = null) => {
  return questions.some((q) => {
    // Skip this question if the provided excludeId matches its ID.
    if (excludeId && q._id && q._id.toString() === excludeId.toString()) {
      return false;
    }

    const sameText =
      q.questionText.trim().toLowerCase() ===
      incomingQuestion.questionText.trim().toLowerCase();

    return sameText;
  });
};