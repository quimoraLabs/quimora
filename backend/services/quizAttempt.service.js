import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { evaluateSnapshotSubmission } from "../utils/grading.utils.js";




// Helper to handle auto-abandoning expired attempts
export const handleExpiredAttempt = async (attempt, quizTimeLimit) => {
    if (!attempt) return null;

    const serverBufferSeconds = 15;
    const maxAllowedSeconds = quizTimeLimit ? (quizTimeLimit * 60) + serverBufferSeconds : 0;

    if (maxAllowedSeconds > 0) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
        if (elapsedSeconds > maxAllowedSeconds) {
            attempt.status = "abandoned";
            await attempt.save();
            return null; // Signals that previous attempt is now closed
        }
    }
    return attempt;
};

// Helper to initialize snapshot creation
export const createAttemptSession = async (userId, quizId) => {
    const rawQuestions = await Question.find({ quizId })
        .select("questionText marks difficulty options")
        .lean();

    if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error("Cannot start a quiz that contains no active questions");
    }

    const questionSnapshots = rawQuestions.map((q) => ({
        questionId: q._id,
        questionText: q.questionText,
        marks: q.marks || 1,
        difficulty: q.difficulty,
        options: (q.options || []).map((opt) => ({
            _id: opt._id,
            optionText: opt.optionText || opt.text,
            isCorrect: Boolean(opt.isCorrect),
        })),
    }));

    const attempt = await QuizAttempt.create({
        userId,
        quizId,
        totalQuestions: rawQuestions.length,
        questionSnapshots,
        status: "started",
        startedAt: new Date(),
    });

    return { attempt, rawQuestions };
};

// Helper to process quiz submission, verify time, and calculate score
export const submitAttemptSession = async (attemptId, userId, userAnswers) => {
    // 1. Fetch active attempt session
    const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId,
        status: "started",
    }).populate("quizId", "timeLimit");

    if (!attempt) {
        const err = new Error("Active quiz session not found or already submitted");
        err.statusCode = 404;
        throw err;
    }

    // 2. Validate Time Allocated Limit
    const now = new Date();
    const timeTakenInSeconds = Math.floor(
        (now.getTime() - new Date(attempt.startedAt).getTime()) / 1000
    );

    const timeLimitInMinutes = attempt.quizId?.timeLimit || 0;
    const serverBufferSeconds = 15;
    const maxAllowedSeconds = timeLimitInMinutes > 0
        ? (timeLimitInMinutes * 60) + serverBufferSeconds
        : 0;

    if (maxAllowedSeconds > 0 && timeTakenInSeconds > maxAllowedSeconds) {
        attempt.status = "abandoned";
        await attempt.save();

        const err = new Error("Submission rejected: The time limit allocated for this session has expired");
        err.statusCode = 400;
        throw err;
    }

    // 3. Evaluate score using stored Question Snapshots
    const { correctAnswersCount, scorePercentage, compiledSnapshotArray } =
        evaluateSnapshotSubmission(userAnswers, attempt.questionSnapshots);

    // 4. Update Attempt Record in DB
    attempt.answers = compiledSnapshotArray;
    attempt.correctAnswersCount = correctAnswersCount;
    attempt.score = scorePercentage;
    attempt.timeTaken = timeTakenInSeconds;
    attempt.status = "completed";
    attempt.completedAt = now;

    await attempt.save();

    return {
        attemptId: attempt._id,
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount,
        scorePercentage,
        timeTakenInSeconds,
        completedAt: attempt.completedAt,
    };
};