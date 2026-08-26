export const evaluateSnapshotSubmission = (
    userAnswers,
    masterSnapshots,
    quizConfig = {}
) => {
    // Hardcoded defaults for testing mode
    const passingScore = quizConfig.passingScore ?? 50;
    const negativeMarkingPercentage = quizConfig.negativeMarkingPercentage ?? 25;

    const userAnswersMap = new Map();
    userAnswers.forEach((ans) => {
        userAnswersMap.set(ans.questionId.toString().trim(), ans.selectedOptions);
    });

    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let unattemptedCount = 0;
    let marksObtained = 0;
    let totalMarks = 0;

    const compiledSnapshotArray = [];

    for (const masterQuestion of masterSnapshots) {
        const qMarks = masterQuestion.marks || 1;
        totalMarks += qMarks;

        const qIdString = masterQuestion.questionId.toString();
        const rawUserSelection = userAnswersMap.get(qIdString);

        // Unattempted check
        if (
            !rawUserSelection ||
            !Array.isArray(rawUserSelection) ||
            rawUserSelection.length === 0 ||
            rawUserSelection[0] === "-1"
        ) {
            unattemptedCount++;
            compiledSnapshotArray.push({
                questionId: masterQuestion.questionId,
                selectedOptions: ["-1"],
                isCorrect: false,
                timeSpent: 0,
            });
            continue;
        }

        const selectedOptionId = rawUserSelection[0].toString().trim();
        const matchedOption = masterQuestion.options.find(
            (opt) => opt._id.toString() === selectedOptionId
        );

        const isCorrect = matchedOption ? Boolean(matchedOption.isCorrect) : false;

        if (isCorrect) {
            correctAnswersCount++;
            marksObtained += qMarks;
        } else {
            incorrectAnswersCount++;
            // Deduct 25% of question marks (e.g., 5 marks question = -1.25 cut)
            const penalty = (qMarks * negativeMarkingPercentage) / 100;
            marksObtained -= penalty;
        }

        compiledSnapshotArray.push({
            questionId: masterQuestion.questionId,
            selectedOptions: [selectedOptionId],
            isCorrect,
            timeSpent: 0,
        });
    }

    marksObtained = Math.max(0, parseFloat(marksObtained.toFixed(2)));
    const scorePercentage =
        totalMarks > 0
            ? parseFloat(((marksObtained / totalMarks) * 100).toFixed(2))
            : 0;
    const passed = scorePercentage >= passingScore;

    return {
        correctAnswersCount,
        incorrectAnswersCount,
        unattemptedCount,
        marksObtained,
        totalMarks,
        scorePercentage,
        passed,
        compiledSnapshotArray,
    };
};