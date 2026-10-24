// import mongoose from "mongoose";
// import Quiz from "../models/quiz.model.js";
// import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import {
  assertUserExists,
  assertQuizExists,
} from "../utils/assertion.utils.js";
// import { formatUniversalResponse } from "../utils/universalFormatter.utils.js";
// import { evaluateSnapshotSubmission } from "../utils/grading.utils.js";
// import {
//   calculateDashboardMetrics,
//   getLeaderboardData,
// } from "../utils/dashboard.utils.js";
import { sanitizeQuestionsForStudent } from "../utils/attempt.utils.js";
import { createAttemptSession, handleExpiredAttempt, submitAttemptSession, saveDraftSession, sanitizeAttemptData, checkQuizEligibility } from "../services/quizAttempt.service.js";
import { fetchStudentDashboardAnalytics, getQuizLeaderboard } from "../services/studentDashboard.service.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import { recordAttemptRewards } from "../services/rewards.service.js";

/**
 * @desc    Quick eligibility check before user enters rules/start screen
 * @route   GET /api/v2/student/quiz/:quizId/eligibility
 * @access  Private (Student)
 * @returns {Object} Eligibility state and attempt quota status
 */
export const checkStudentQuizEligibility = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    const eligibility = await checkQuizEligibility(quizId, userId);

    // Fetch decoupled pass and fail progress tracker
    let progress = await StudentQuizProgress.findOne({ userId, quizId }).lean();
    if (!progress) {
      progress = {
        passAttemptsCount: 0,
        maxPassAllowed: 3,
        failAttemptsCount: 0,
        isLocked: false,
        lockReason: "NONE",
        appealStatus: "NONE",
      };
    }

    const isLocked =
      progress.isLocked ||
      progress.failAttemptsCount >= 6 ||
      progress.passAttemptsCount >= progress.maxPassAllowed;

    const lockReason =
      progress.lockReason !== "NONE"
        ? progress.lockReason
        : progress.failAttemptsCount >= 6
        ? "FAIL_LIMIT_EXCEEDED"
        : progress.passAttemptsCount >= progress.maxPassAllowed
        ? "PASS_LIMIT_REACHED"
        : "NONE";

    return res.status(200).json({
      success: true,
      data: {
        ...eligibility,
        isEligible: eligibility.isEligible && !isLocked,
        progress: {
          ...progress,
          isLocked,
          lockReason,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start or resume a quiz session for student
 * @route   POST /api/v2/student/quiz/start
 * @access  Private (Student)
 * @returns {Object} Attempt ID, remaining time, and sanitized questions
 */

export const startQuizAttempt = async (req, res, next) => {
  try {
    const { quizId, questionLimit, difficulty } = req.body;
    const userId = req.auth.userId.toString();

    // 1. Fetch & Validate Quiz Availability
    const quiz = await assertQuizExists(quizId);
    if (quiz.status !== "published" || !quiz.isActive) {
      return res.status(400).json({ error: "Quiz is currently unavailable" });
    }

    // 1.1 Validate Question Limit (Options: 10, 15, 20, 25, 30, 40, 50, or total bank)
    const totalQuizQuestions = Array.isArray(quiz.questions) ? quiz.questions.length : 15;
    const ALLOWED_LIMITS = Array.from(new Set([10, 15, 20, 25, 30, 40, 50, totalQuizQuestions])).filter(n => n > 0);
    if (questionLimit && !ALLOWED_LIMITS.includes(Number(questionLimit))) {
      return res.status(400).json({
        error: `Invalid question limit. Allowed options are: ${ALLOWED_LIMITS.join(", ")}`,
      });
    }

    // 1.2 Validate Difficulty Level (beginner, intermediate, hard, expert, mixed)
    const ALLOWED_DIFFICULTIES = ["beginner", "intermediate", "hard", "expert", "mixed"];
    const chosenDifficulty = difficulty && ALLOWED_DIFFICULTIES.includes(String(difficulty).toLowerCase())
      ? String(difficulty).toLowerCase()
      : "beginner";

    // 3. Check Decoupled Fail & Pass Limits (StudentQuizProgress)
    const progress = await StudentQuizProgress.findOne({ userId, quizId });
    if (progress) {
      if (progress.isLocked || progress.failAttemptsCount >= 6) {
        if (progress.failAttemptsCount >= 6 && !progress.isLocked) {
          progress.isLocked = true;
          progress.lockReason = "FAIL_LIMIT_EXCEEDED";
          await progress.save();
        }
        return res.status(403).json({
          success: false,
          error: "Quiz is locked due to reaching 6 failed attempts. Please submit an Admin Appeal to proceed.",
          isLocked: true,
          lockReason: "FAIL_LIMIT_EXCEEDED",
          failAttemptsCount: progress.failAttemptsCount,
        });
      }
      if (progress.passAttemptsCount >= (progress.maxPassAllowed || 3)) {
        if (!progress.isLocked) {
          progress.isLocked = true;
          progress.lockReason = "PASS_LIMIT_REACHED";
          await progress.save();
        }
        return res.status(403).json({
          success: false,
          error: `You have reached the maximum allowed pass attempts (${progress.maxPassAllowed || 3}) for this quiz. Unlock an extra pass attempt in the Reward Store.`,
          isLocked: true,
          lockReason: "PASS_LIMIT_REACHED",
          passAttemptsCount: progress.passAttemptsCount,
          maxPassAllowed: progress.maxPassAllowed || 3,
        });
      }
    }

    // 4. Resolve Active Attempt / Auto-Abandon Logic
    let activeAttempt = await QuizAttempt.findOne({ userId, quizId, status: "started" });
    activeAttempt = await handleExpiredAttempt(activeAttempt, quiz.timeLimit);

    // 3. Attempt Allocation Limit Check (Only for NEW attempts)
    const effectiveMaxAttempts = Math.min(Number(quiz.maxAttempts) || 3, 3);
    if (!activeAttempt && effectiveMaxAttempts > 0) {
      const pastAttempts = await QuizAttempt.countDocuments({
        userId,
        quizId,
        status: { $in: ["completed", "abandoned"] }
      });
      if (pastAttempts >= effectiveMaxAttempts) {
        return res.status(403).json({
          success: false,
          error: `Maximum allotment of ${effectiveMaxAttempts} attempts reached`
        });
      }
    }

    // 4. Reuse Existing or Create Fresh Attempt Session
    let attempt = activeAttempt;
    let questionsForResponse;

    if (!attempt) {
      const sessionData = await createAttemptSession(userId, quizId, questionLimit, chosenDifficulty);
      attempt = sessionData.attempt;
      questionsForResponse = sessionData.rawQuestions;
    } else {
      // Use frozen snapshots for active session continuity
      questionsForResponse = attempt.questionSnapshots;
    }

    // Format saved draft answers if any
    const savedAnswersMap = (attempt.answers || []).map((ans) => ({
      questionId: ans.questionId,
      selectedOptions: ans.selectedOptions,
    }));

    // Calibrate time limit proportionally to questions count (1 min per question, minimum 5 mins)
    const sessionTimeLimit = attempt.totalQuestions
      ? Math.max(5, Math.ceil(attempt.totalQuestions * 1))
      : (quiz.timeLimit || 10);

    const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
    const remainingTimeSeconds = sessionTimeLimit ? Math.max(0, (sessionTimeLimit * 60) - elapsedSeconds) : null;

    // 5. Send Clean Secure Payload Response
    return res.status(200).json({
      success: true,
      message: "Quiz session initialized successfully",
      data: {
        attemptId: attempt._id,
        startedAt: attempt.startedAt,
        remainingTimeSeconds,
        answers: savedAnswersMap,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: sessionTimeLimit,
          totalQuestions: questionsForResponse.length,
          questions: sanitizeQuestionsForStudent(questionsForResponse),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save draft answers for active quiz session
 * @route   PATCH /api/v2/student/quiz/save-draft
 * @access  Private (Student)
 * @returns {Object} Save result status
 */
export const saveQuizDraft = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body;
    const userId = req.auth.userId.toString();

    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid draft submission request payload" });
    }

    const result = await saveDraftSession(attemptId, userId, answers);
    return res.status(200).json({
      success: true,
      message: "Draft saved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Submit or finish current quiz session for student
 * @route   POST /api/v2/student/quiz/submit
 * @access  Private (Student)
 * @returns {Object} Score, breakdown, and updated Elo rating
 */
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body;
    const userId = req.auth.userId.toString();

    // 1. Input Validation Check
    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid submission request payload" });
    }

    // 1.5 Strict Lockout Pre-check
    const currentAttempt = await QuizAttempt.findOne({ _id: attemptId, userId }).select("quizId status").lean();
    if (!currentAttempt) {
      return res.status(404).json({ error: "Active quiz session not found or already submitted" });
    }
    if (currentAttempt.quizId) {
      const progress = await StudentQuizProgress.findOne({ userId, quizId: currentAttempt.quizId }).lean();
      if (progress) {
        if (progress.failAttemptsCount >= 6 || (progress.isLocked && progress.lockReason === "FAIL_LIMIT_EXCEEDED")) {
          return res.status(403).json({
            success: false,
            error: "Quiz is locked due to reaching 6 failed attempts. Please submit an Admin Appeal to proceed.",
            isLocked: true,
            lockReason: "FAIL_LIMIT_EXCEEDED",
          });
        }
        if (progress.passAttemptsCount >= (progress.maxPassAllowed || 3) || (progress.isLocked && progress.lockReason === "PASS_LIMIT_REACHED")) {
          return res.status(403).json({
            success: false,
            error: `You have reached the maximum allowed pass attempts (${progress.maxPassAllowed || 3}) for this quiz.`,
            isLocked: true,
            lockReason: "PASS_LIMIT_REACHED",
          });
        }
      }
    }

    // 2. Execute Submission Logic via Service Layer
    const result = await submitAttemptSession(attemptId, userId, answers);

    // 3. Record Pass/Fail Trackers and Award Coins
    const attempt = await QuizAttempt.findById(attemptId).select("quizId").lean();
    if (attempt && attempt.quizId) {
      const rewardResult = await recordAttemptRewards(
        userId,
        attempt.quizId,
        result.scorePercentage
      );
      result.rewards = rewardResult;
    }

    // 4. Send Success Response
    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Get detailed view of a single quiz attempt for student
 * @route   GET /api/v2/student/attempts/:attemptId
 * @access  Private (Student)
 * @returns {Object} Sanitized attempt details with question snapshots
 */
export const getStudentAttemptDetails = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.auth.userId.toString();

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
      .populate({
        path: "quizId",
        select: "title timeLimit tags",
      })
      .populate({
        path: "userId",
        select: "name username email",
      })
      .lean();

    if (!attempt) {
      return res.status(404).json({
        error: "Quiz attempt session not found for this user",
      });
    }

    // Service call for single object
    const sanitizedData = sanitizeAttemptData(attempt, true);

    return res.status(200).json({
      success: true,
      data: sanitizedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all historical attempts taken by the logged-in student
 * @route   GET /api/v2/student/attempts
 * @access  Private (Student)
 * @returns {Object} List of sanitized historical quiz attempts
 */

export const getStudentAttemptHistory = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();

    const attempts = await QuizAttempt.find({ userId })
      .sort({ startedAt: -1 })
      .populate({
        path: "quizId",
        select: "title tags",
      })
      .lean();

    // Pass false so question snapshots are NOT included in the list view
    const sanitizedAttempts = attempts.map((attempt) =>
      sanitizeAttemptData(attempt, false)
    );

    return res.status(200).json({
      success: true,
      count: sanitizedAttempts.length,
      data: sanitizedAttempts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quick summary result for a submitted attempt
 * @route   GET /api/v2/student/attempts/:attemptId/result
 * @access  Private (Student)
 * @returns {Object} Score summary and time taken
 */
export const getStudentAttemptResultSummary = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.auth.userId.toString();

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
      .select("totalQuestions correctAnswersCount score timeTaken status completedAt")
      .lean();

    if (!attempt) {
      return res.status(404).json({
        error: "Quiz attempt session not found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: attempt._id,
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount: attempt.correctAnswersCount,
        score: attempt.score,
        timeTakenInSeconds: attempt.timeTaken,
        status: attempt.status,
        completedAt: attempt.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive analytics & stats for student dashboard
 * @route   GET /api/v2/student/dashboard
 * @access  Private (Student)
 * @returns {Object} Student dashboard metrics and recent activity
 */
export const getStudentDashboardStats = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();

    // Delegate all heavy aggregation & metric logic to the service
    const dashboardData = await fetchStudentDashboardAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leaderboard specifically for a single quiz
 * @route   GET /api/v2/student/leaderboard/quiz/:quizId
 * @access  Private (Student)
 * @returns {Object} Ranked list of top student scores for the quiz
 */
export const getStudentQuizWiseLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    const leaderboardData = await getQuizLeaderboard(quizId, userId, 10);

    return res.status(200).json({
      success: true,
      data: leaderboardData,
    });
  } catch (error) {
    next(error);
  }
};