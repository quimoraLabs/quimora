export const evaluateSnapshotSubmission = (userAnswers, masterSnapshots) => {
    const userAnswersMap = new Map();
    userAnswers.forEach((ans) => {
        userAnswersMap.set(ans.questionId.toString().trim(), ans.selectedOptions);
    });

    let correctAnswersCount = 0;
    const compiledSnapshotArray = [];

    for (const masterQuestion of masterSnapshots) {
        const qIdString = masterQuestion.questionId.toString();
        const rawUserSelection = userAnswersMap.get(qIdString);

        // 1. Check if Skipped or Unattempted
        if (
            !rawUserSelection ||
            !Array.isArray(rawUserSelection) ||
            rawUserSelection.length === 0 ||
            rawUserSelection[0] === "-1"
        ) {
            compiledSnapshotArray.push({
                questionId: masterQuestion.questionId,
                selectedOptions: ["-1"],
                isCorrect: false,
                timeSpent: 0,
            });
            continue;
        }

        // 2. Extract selected option ID from payload
        const selectedOptionId = rawUserSelection[0].toString().trim();

        // 3. Find the option in master snapshot options array
        const matchedOption = masterQuestion.options.find(
            (opt) => opt._id.toString() === selectedOptionId
        );

        // 4. Check correctness cleanly
        const isCorrect = matchedOption ? Boolean(matchedOption.isCorrect) : false;

        if (isCorrect) {
            correctAnswersCount++;
        }

        compiledSnapshotArray.push({
            questionId: masterQuestion.questionId,
            selectedOptions: [selectedOptionId],
            isCorrect,
            timeSpent: 0,
        });
    }

    const totalQuestions = masterSnapshots.length;
    const scorePercentage =
        totalQuestions > 0
            ? parseFloat(((correctAnswersCount / totalQuestions) * 100).toFixed(2))
            : 0;

    return {
        correctAnswersCount,
        scorePercentage,
        compiledSnapshotArray,
    };
};