export const sanitizeQuestionsForStudent = (rawQuestions) => {
    return rawQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        marks: q.marks,
        difficulty: q.difficulty,
        options: q.options
            ? q.options.map((opt) => ({
                _id: opt._id,
                optionText: opt.optionText || opt.text,
            }))
            : [],
    }));
};