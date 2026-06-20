export const isDuplicateQuestion = (questions, incomingQuestion, excludeId = null) => {
  return questions.some((q) => {
    // Agar excludeId pass hui hai aur wo is question ki ID se match karti hai, to isko skip karo
    if (excludeId && q._id && q._id.toString() === excludeId.toString()) {
      return false;
    }

    const sameText =
      q.questionText.trim().toLowerCase() ===
      incomingQuestion.questionText.trim().toLowerCase();

    return sameText;
  });
};