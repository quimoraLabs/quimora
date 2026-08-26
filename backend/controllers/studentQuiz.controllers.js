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
import { createAttemptSession, handleExpiredAttempt, submitAttemptSession, sanitizeAttemptData, checkQuizEligibility } from "../services/quizAttempt.service.js";
import { fetchStudentDashboardAnalytics, getQuizLeaderboard } from "../services/studentDashboard.service.js";

/**
 * @desc    Quick eligibility check before user enters rules/start screen
 * @route   GET /api/v1/student/quiz/:quizId/eligibility
 * @access  Private (Student)
 */
export const checkStudentQuizEligibility = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    const eligibility = await checkQuizEligibility(quizId, userId);

    return res.status(200).json({
      success: true,
      data: eligibility,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start or resume a quiz session for student
 * @route   POST /api/v1/student/quiz/start
 * @access  Private (Student)
 */

export const startQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    const userId = req.auth.userId.toString();

    // 1. Fetch & Validate Quiz Availability
    const quiz = await assertQuizExists(quizId);
    if (quiz.status !== "published" || !quiz.isActive) {
      return res.status(400).json({ error: "Quiz is currently unavailable" });
    }

    // 2. Resolve Active Attempt / Auto-Abandon Logic
    let activeAttempt = await QuizAttempt.findOne({ userId, quizId, status: "started" });
    activeAttempt = await handleExpiredAttempt(activeAttempt, quiz.timeLimit);

    // 3. Attempt Allocation Limit Check (Only for NEW attempts)
    if (!activeAttempt && quiz.maxAttempts > 0) {
      const pastAttempts = await QuizAttempt.countDocuments({
        userId,
        quizId,
        status: { $in: ["completed", "abandoned"] }
      });
      if (pastAttempts >= quiz.maxAttempts) {
        return res.status(403).json({
          success: false,
          error: `Maximum allotment of ${quiz.maxAttempts} attempts reached`
        });
      }
    }

    // 4. Reuse Existing or Create Fresh Attempt Session
    let attempt = activeAttempt;
    let questionsForResponse;

    if (!attempt) {
      const sessionData = await createAttemptSession(userId, quizId);
      attempt = sessionData.attempt;
      questionsForResponse = sessionData.rawQuestions;
    } else {
      // Use frozen snapshots for active session continuity
      questionsForResponse = attempt.questionSnapshots;
    }

    // 5. Send Clean Secure Payload Response
    return res.status(200).json({
      success: true,
      message: "Quiz session initialized successfully",
      data: {
        attemptId: attempt._id,
        startedAt: attempt.startedAt,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
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
 * @desc    Submit or finish current quiz session for student
 * @route   POST /api/v1/student/quiz/submit
 * @access  Private (Student)
 */
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body;
    const userId = req.auth.userId.toString();

    // 1. Input Validation Check
    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid submission request payload" });
    }

    // 2. Execute Submission Logic via Service Layer
    const result = await submitAttemptSession(attemptId, userId, answers);



    // 3. Send Success Response
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
 * @route   GET /api/v1/student/attempts/:attemptId
 * @access  Private (Student)
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
 * @route   GET /api/v1/student/attempts
 * @access  Private (Student)
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
 * @route   GET /api/v1/student/attempts/:attemptId/result
 * @access  Private (Student)
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
 * @route   GET /api/v1/student/dashboard
 * @access  Private (Student)
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
 * @route   GET /api/v1/student/leaderboard/quiz/:quizId
 * @access  Private (Student)
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