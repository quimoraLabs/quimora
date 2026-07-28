import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { evaluateSnapshotSubmission } from "../utils/grading.utils.js";
import Quiz from "../models/quiz.model.js";


/**
 * Quick eligibility check before letting user open quiz modal or start test
 */
export const checkQuizEligibility = async (quizId, userId) => {
    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz || !quiz.isActive || quiz.status !== "published") {
        return {
            isEligible: false,
            reason: "Quiz is currently inactive or unavailable.",
        };
    }

    // Check completed or abandoned attempts count
    const attemptCount = await QuizAttempt.countDocuments({
        userId,
        quizId,
        status: { $in: ["completed", "abandoned"] },
    });

    if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
        return {
            isEligible: false,
            reason: `Maximum allotment of ${quiz.maxAttempts} attempts reached for this quiz.`,
            attemptsUsed: attemptCount,
            maxAttempts: quiz.maxAttempts,
        };
    }

    // Check if there's an ongoing active session
    const activeAttempt = await QuizAttempt.findOne({
        userId,
        quizId,
        status: "started",
    }).lean();

    return {
        isEligible: true,
        hasActiveSession: Boolean(activeAttempt),
        activeAttemptId: activeAttempt ? activeAttempt._id : null,
        attemptsRemaining: quiz.maxAttempts > 0 ? quiz.maxAttempts - attemptCount : null,
    };
};

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

/**
 * Sanitizes attempt data.
 * @param {Object} attempt - Raw attempt object from database
 * @param {boolean} includeQuestions - Flag to conditionally attach questions array
 */
export const sanitizeAttemptData = (attempt, includeQuestions = false) => {
    if (!attempt) return null;

    // Default lightweight summary object
    const sanitized = {
        _id: attempt._id,
        quizTitle: attempt.quizId?.title || "Quiz",
        tags: Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [],
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount: attempt.correctAnswersCount,
        score: attempt.score,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeTakenInSeconds: attempt.timeTaken,
    };

    // Conditionally attach questions array ONLY when explicitly requested
    if (includeQuestions && Array.isArray(attempt.questionSnapshots)) {
        sanitized.questions = attempt.questionSnapshots.map((snapshot) => {
            const answer = attempt.answers?.find(
                (ans) => ans.questionId.toString() === snapshot.questionId.toString()
            );

            return {
                questionId: snapshot.questionId,
                questionText: snapshot.questionText,
                marks: snapshot.marks,
                isCorrect: Boolean(answer?.isCorrect),
            };
        });
    }

    return sanitized;
};