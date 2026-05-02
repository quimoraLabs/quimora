export const isDuplicateQuestion = (questions, incomingQuestion) => {
  return questions.some((q) => {
    const sameText =
      q.questionText.trim().toLowerCase() ===
      incomingQuestion.questionText.trim().toLowerCase();

    return sameText;
  });
};