import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { evaluateSnapshotSubmission } from "../utils/grading.utils.js";
import Quiz from "../models/quiz.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import EloRating from "../models/eloRating.model.js";

export const getTierFromElo = (elo) => {
    if (elo >= 1800) return "Expert";
    if (elo >= 1600) return "Master";
    if (elo >= 1400) return "Advanced";
    if (elo >= 1200) return "Intermediate";
    if (elo >= 1000) return "Learner";
    return "Beginner";
};


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

// Helper to initialize snapshot creation (supports student difficulty selection & question limits)
export const createAttemptSession = async (userId, quizId, questionLimit = null, difficulty = "beginner") => {
    let rawQuestions = await Question.find({ quizId })
        .select("questionText marks difficulty options eloRating")
        .lean();

    if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error("Cannot start a quiz that contains no active questions");
    }

    // Determine target limit
    let limit = questionLimit ? parseInt(questionLimit, 10) : 50;
    if (isNaN(limit) || limit <= 0) {
        limit = 50;
    }
    const maxSelectable = Math.min(limit, rawQuestions.length);

    // Filter and order questions according to chosen difficulty (Beginner, Intermediate, Hard, Expert, Mixed)
    let orderedQuestions = [];
    const normalizedDiff = (difficulty || "beginner").toLowerCase();

    const easyQs = rawQuestions.filter((q) => q.difficulty === "easy");
    const mediumQs = rawQuestions.filter((q) => q.difficulty === "medium");
    const hardQs = rawQuestions.filter((q) => q.difficulty === "hard");

    // Fisher-Yates shuffle helper
    const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    if (normalizedDiff === "beginner") {
        // Prioritize Easy -> Medium -> Hard (Progressive beginner start, strictly no architectural shocks)
        orderedQuestions = [
            ...shuffleArray(easyQs),
            ...shuffleArray(mediumQs),
            ...shuffleArray(hardQs),
        ];
    } else if (normalizedDiff === "intermediate") {
        // Prioritize Medium -> Easy -> Hard
        orderedQuestions = [
            ...shuffleArray(mediumQs),
            ...shuffleArray(easyQs),
            ...shuffleArray(hardQs),
        ];
    } else if (normalizedDiff === "hard") {
        // Prioritize Hard -> Medium -> Easy
        orderedQuestions = [
            ...shuffleArray(hardQs),
            ...shuffleArray(mediumQs),
            ...shuffleArray(easyQs),
        ];
    } else if (normalizedDiff === "expert") {
        // High challenge questions, prioritizing Hard with highest Elo
        const sortedByElo = [...rawQuestions].sort(
            (a, b) => (b.eloRating || 1200) - (a.eloRating || 1200)
        );
        orderedQuestions = sortedByElo;
    } else {
        // "mixed" / "all" / "random": Progressive tiered distribution:
        // Warmup easy questions first, medium application questions, hard mastery questions
        orderedQuestions = [
            ...shuffleArray(easyQs),
            ...shuffleArray(mediumQs),
            ...shuffleArray(hardQs),
        ];
    }

    // Fallback if difficulty buckets were empty
    if (orderedQuestions.length === 0) {
        orderedQuestions = shuffleArray(rawQuestions);
    }

    const selectedQuestions = orderedQuestions.slice(0, maxSelectable);

    // Shuffle options within each question so ABCD positions cannot be memorized
    const questionSnapshots = selectedQuestions.map((q) => {
        const shuffledOptions = [...(q.options || [])];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }

        return {
            questionId: q._id,
            questionText: q.questionText,
            marks: q.marks || 1,
            difficulty: q.difficulty,
            options: shuffledOptions.map((opt) => ({
                _id: opt._id,
                optionText: opt.optionText || opt.text,
                isCorrect: Boolean(opt.isCorrect),
            })),
        };
    });

    const attempt = await QuizAttempt.create({
        userId,
        quizId,
        totalQuestions: questionSnapshots.length,
        questionSnapshots,
        selectedDifficulty: normalizedDiff,
        status: "started",
        startedAt: new Date(),
    });

    return { attempt, rawQuestions: questionSnapshots };
};

// Helper to process quiz submission, verify time, calculate score, and adjust student Elo/grade
export const submitAttemptSession = async (attemptId, userId, userAnswers) => {
    // 1. Fetch active attempt session with quiz settings
    const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId,
        status: "started",
    }).populate("quizId", "title tags timeLimit passingScore negativeMarking interestIds");

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

    // 3. Evaluate score with negative marking & passing score options
    const {
        correctAnswersCount,
        incorrectAnswersCount,
        unattemptedCount,
        marksObtained,
        totalMarks,
        scorePercentage,
        passed,
        compiledSnapshotArray
    } = evaluateSnapshotSubmission(
        userAnswers,
        attempt.questionSnapshots,
        {
            negativeMarking: attempt.quizId?.negativeMarking ?? 25,
            negativeMarkingPercentage: attempt.quizId?.negativeMarking ?? 25,
            passingScore: attempt.quizId?.passingScore ?? 50
        }
    );

    // 4. Dynamic Experience Points & Elo Progression / Penalty Engine
    const difficulty = attempt.selectedDifficulty || "beginner";
    let studentProfile = await StudentProfile.findOne({ userId });
    if (!studentProfile) {
        studentProfile = await StudentProfile.create({ userId });
    }

    const currentElo = studentProfile.overallElo || 1000;
    const oldTier = studentProfile.levelName || getTierFromElo(currentElo);

    let eloDelta = 0;
    if (passed) {
        // High score mastery bonuses
        if (scorePercentage >= 90) {
            if (difficulty === "expert") eloDelta = 55;
            else if (difficulty === "hard") eloDelta = 45;
            else if (difficulty === "intermediate") eloDelta = 35;
            else if (difficulty === "mixed") eloDelta = 30;
            else eloDelta = 25; // beginner
        } else if (scorePercentage >= 75) {
            if (difficulty === "expert") eloDelta = 40;
            else if (difficulty === "hard") eloDelta = 32;
            else if (difficulty === "intermediate") eloDelta = 25;
            else if (difficulty === "mixed") eloDelta = 22;
            else eloDelta = 18;
        } else {
            // Passed (50% - 74%)
            if (difficulty === "expert") eloDelta = 28;
            else if (difficulty === "hard") eloDelta = 22;
            else if (difficulty === "intermediate") eloDelta = 18;
            else if (difficulty === "mixed") eloDelta = 15;
            else eloDelta = 12;
        }
    } else {
        // Poor Result / Failed (< 50%) -> Experience points drop / Grade low hota jayega!
        // The higher the tier attempted, the heavier the penalty
        if (difficulty === "expert") {
            eloDelta = -45;
        } else if (difficulty === "hard") {
            eloDelta = -32;
        } else if (difficulty === "intermediate") {
            eloDelta = -20;
        } else if (difficulty === "mixed") {
            eloDelta = -15;
        } else {
            eloDelta = -10; // beginner
        }

        // Additional penalty if very low score (< 30%)
        if (scorePercentage < 30) {
            eloDelta -= 8;
        }
    }

    const newElo = Math.max(100, currentElo + eloDelta);
    const newTier = getTierFromElo(newElo);
    const isDemoted = newElo < currentElo && oldTier !== newTier;
    const isPromoted = newElo > currentElo && oldTier !== newTier;

    // Update StudentProfile
    studentProfile.overallElo = newElo;
    studentProfile.levelName = newTier;
    if (eloDelta > 0) {
        studentProfile.experiencePoints = (studentProfile.experiencePoints || 0) + (eloDelta * 10);
    }
    await studentProfile.save();

    // Update EloRating records for matching quiz interests
    const quizDoc = attempt.quizId;
    if (quizDoc && Array.isArray(quizDoc.interestIds) && quizDoc.interestIds.length > 0) {
        for (const interestId of quizDoc.interestIds) {
            await EloRating.findOneAndUpdate(
                { studentId: userId, interestId },
                {
                    $inc: { rating: eloDelta, quizzesAttempted: 1 },
                    $max: { highestRating: newElo },
                    $set: { lastUpdated: new Date() },
                },
                { upsert: true }
            );
        }
    } else {
        // Update all active student EloRating records
        await EloRating.updateMany(
            { studentId: userId, isArchived: false },
            {
                $inc: { rating: eloDelta, quizzesAttempted: 1 },
                $set: { lastUpdated: new Date() },
            }
        );
    }

    const eloSummary = {
        studentEloBefore: currentElo,
        studentEloAfter: newElo,
        delta: eloDelta,
        oldTier,
        newTier,
        isDemoted,
        isPromoted,
        difficulty,
    };

    // 5. Update Attempt Record in DB
    attempt.answers = compiledSnapshotArray;
    attempt.correctAnswersCount = correctAnswersCount;
    attempt.incorrectAnswersCount = incorrectAnswersCount; 
    attempt.unattemptedCount = unattemptedCount;
    attempt.marksObtained = marksObtained;
    attempt.totalMarks = totalMarks;
    attempt.passed = passed;
    attempt.score = scorePercentage;
    attempt.timeTaken = timeTakenInSeconds;
    attempt.status = "completed";
    attempt.completedAt = now;
    attempt.eloChange = eloSummary;

    await attempt.save();

    return {
        attemptId: attempt._id,
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount,
        incorrectAnswersCount,
        unattemptedCount,
        marksObtained,
        totalMarks,
        scorePercentage,
        passed,
        timeTakenInSeconds,
        completedAt: attempt.completedAt,
        eloChange: eloSummary,
    };
};

/**
 * Saves draft answers for an active session without completing it
 */
export const saveDraftSession = async (attemptId, userId, userAnswers) => {
    const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        userId,
        status: "started",
    });

    if (!attempt) {
        const err = new Error("Active quiz session not found or already submitted");
        err.statusCode = 404;
        throw err;
    }

    if (Array.isArray(userAnswers)) {
        attempt.answers = userAnswers.map((ans) => ({
            questionId: ans.questionId,
            selectedOptions: Array.isArray(ans.selectedOptions)
                ? ans.selectedOptions
                : [ans.selectedOptions].filter(Boolean),
            isCorrect: false,
            timeSpent: ans.timeSpent || 0,
        }));
        await attempt.save();
    }

    return { success: true, savedAnswersCount: attempt.answers.length };
};

/**
 * Sanitizes attempt data.
 * @param {Object} attempt - Raw attempt object from database
 * @param {boolean} includeQuestions - Flag to conditionally attach questions array
 */
export const sanitizeAttemptData = (attempt, includeQuestions = false) => {
    if (!attempt) return null;

    // Lightweight summary object with evaluation metrics
    const sanitized = {
        _id: attempt._id,
        studentName: attempt.userId?.name || attempt.userId?.username || "Student",
        quizTitle: attempt.quizId?.title || "Quiz",
        tags: Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [],
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount: attempt.correctAnswersCount || 0,
        // New calculation metrics added below
        incorrectAnswersCount: attempt.incorrectAnswersCount || 0,
        unattemptedCount: attempt.unattemptedCount || 0,
        marksObtained: attempt.marksObtained || 0,
        totalMarks: attempt.totalMarks || 0,
        passed: Boolean(attempt.passed),
        score: attempt.score || 0,
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
                options: (snapshot.options || []).map((opt) => ({
                    _id: opt._id,
                    optionText: opt.optionText || opt.text,
                })),
                selectedOptions: answer?.selectedOptions || [],
                isCorrect: Boolean(answer?.isCorrect),
            };
        });
    }

    return sanitized;
};