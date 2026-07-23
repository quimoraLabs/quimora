import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import {
  assertUserExists,
  assertQuizExists,
} from "../utils/assertion.utils.js";
import { formatUniversalResponse } from "../utils/universalFormatter.utils.js";
import { evaluateSnapshotSubmission } from "../utils/grading.utils.js";
import {
  calculateDashboardMetrics,
  getLeaderboardData,
} from "../utils/dashboard.utils.js";
import { sanitizeQuestionsForStudent } from "../utils/attempt.utils.js";
import { createAttemptSession, handleExpiredAttempt,submitAttemptSession } from "../services/quizAttempt.service.js";



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
    if (!quiz.status === "published" || !quiz.isActive) {
      return res.status(400).json({ error: "Quiz is currently unavailable" });
    }

    // 2. Resolve Active Attempt / Auto-Abandon Logic
    let activeAttempt = await QuizAttempt.findOne({ userId, quizId, status: "started" });
    activeAttempt = await handleExpiredAttempt(activeAttempt, quiz.timeLimit);

    // 3. Attempt Allocation Limit Check
    if (quiz.maxAttempts > 0) {
      const pastAttempts = await QuizAttempt.countDocuments({ userId, quizId, status: { $in: ["completed", "abandoned"] } });
      if (pastAttempts >= quiz.maxAttempts) {
        return res.status(403).json({ error: `Maximum allotment of ${quiz.maxAttempts} attempts reached` });
      }
    }

    // 4. Reuse Existing or Create Fresh Attempt
    let attempt = activeAttempt;
    let rawQuestions;

    if (!attempt) {
      const sessionData = await createAttemptSession(userId, quizId);
      attempt = sessionData.attempt;
      rawQuestions = sessionData.rawQuestions;
    } else {
      rawQuestions = await Question.find({ quizId }).lean();
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
          totalQuestions: rawQuestions.length,
          questions: sanitizeQuestionsForStudent(rawQuestions),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluates, grades, and secures an ongoing quiz session based on object choice options.
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
                select: "title description timeLimit tags",
            })
            .lean();

        if (!attempt) {
            return res.status(404).json({
                error: "Quiz attempt session not found for this user",
            });
        }

        return res.status(200).json({
            success: true,
            data: attempt,
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
export const getAllStudentAttempts = async (req, res, next) => {
    try {
        const userId = req.auth.userId.toString();

        const attempts = await QuizAttempt.find({ userId })
            .sort({ startedAt: -1 })
            .populate({
                path: "quizId",
                select: "title tags",
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: attempts.length,
            data: attempts,
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

        // 1. Fetch user's completed attempts
        const completedAttempts = await QuizAttempt.find({
            userId,
            status: "completed",
        })
            .sort({ completedAt: -1 })
            .populate({ path: "quizId", select: "title tags" })
            .lean();

        // Default empty dashboard state for fresh student
        if (!completedAttempts || completedAttempts.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalTestsTaken: 0,
                    averageScore: 0,
                    maxScore: 0,
                    minScore: 0,
                    currentRank: null,
                    latestResult: null,
                    performanceTrend: [],
                    predictedNextScore: 0,
                    weakAreas: [],
                    recentHistory: [],
                    leaderboard: [],
                },
            });
        }

        // 2. Metric Calculations
        const totalTestsTaken = completedAttempts.length;
        const scores = completedAttempts.map((attempt) => attempt.score);
        const averageScore = parseFloat(
            (scores.reduce((sum, score) => sum + score, 0) / totalTestsTaken).toFixed(2)
        );
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        const latestAttempt = completedAttempts[0];

        // 3. Format History & Trends
        const recentHistory = completedAttempts.slice(0, 5).map((attempt) => ({
            id: attempt._id,
            quizTitle: attempt.quizId?.title || "Untitled Quiz",
            score: attempt.score,
            status: attempt.status,
            completedAt: attempt.completedAt,
            totalQuestions: attempt.totalQuestions,
            correctAnswersCount: attempt.correctAnswersCount,
            timeTakenInSeconds: attempt.timeTaken,
            tags: Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [],
        }));

        const performanceTrend = completedAttempts
            .slice(0, 8)
            .reverse()
            .map((attempt) => ({
                label: new Date(attempt.completedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                score: attempt.score,
            }));

        // 4. Trend Slope Prediction
        const predictedNextScore = (() => {
            if (performanceTrend.length <= 1) {
                return performanceTrend[0]?.score ?? averageScore;
            }
            const firstScore = performanceTrend[0].score;
            const lastScore = performanceTrend[performanceTrend.length - 1].score;
            const slope = (lastScore - firstScore) / (performanceTrend.length - 1);
            return Number(Math.min(100, Math.max(0, lastScore + slope)).toFixed(1));
        })();

        // 5. Weak Areas Breakdown
        const tagBuckets = completedAttempts.reduce((acc, attempt) => {
            const tags = Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [];
            tags.forEach((tag) => {
                const tagKey = typeof tag === "object" ? tag.toString() : tag;
                if (!acc[tagKey]) {
                    acc[tagKey] = { totalScore: 0, count: 0 };
                }
                acc[tagKey].totalScore += attempt.score;
                acc[tagKey].count += 1;
            });
            return acc;
        }, {});

        const weakAreas = Object.entries(tagBuckets)
            .map(([tag, bucket]) => ({
                tag,
                averageScore: parseFloat((bucket.totalScore / bucket.count).toFixed(1)),
                attempts: bucket.count,
            }))
            .sort((a, b) => a.averageScore - b.averageScore)
            .slice(0, 4);

        // 6. Optimized Aggregate Leaderboard & User Rank Calculation
        const globalLeaderboard = await QuizAttempt.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$userId",
                    averageScore: { $avg: "$score" },
                    totalTests: { $sum: 1 },
                    maxScore: { $max: "$score" },
                },
            },
            { $sort: { averageScore: -1, totalTests: -1 } },
            {
                $facet: {
                    top20: [
                        { $limit: 20 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        { $unwind: "$user" },
                        {
                            $project: {
                                _id: 0,
                                userId: "$_id",
                                name: "$user.name",
                                averageScore: { $round: ["$averageScore", 2] },
                                totalTests: 1,
                                maxScore: 1,
                            },
                        },
                    ],
                    allRanks: [
                        {
                            $project: {
                                userId: "$_id",
                            },
                        },
                    ],
                },
            },
        ]);

        const top20Data = globalLeaderboard[0]?.top20 || [];
        const allRanksData = globalLeaderboard[0]?.allRanks || [];

        const userRankIndex = allRanksData.findIndex(
            (entry) => entry.userId.toString() === userId
        );
        const currentRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

        const leaderboard = top20Data.map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            averageScore: entry.averageScore,
            totalTests: entry.totalTests,
            isMe: entry.userId.toString() === userId,
        }));

        // 7. Final Clean Dashboard Payload Response
        return res.status(200).json({
            success: true,
            data: {
                totalTestsTaken,
                averageScore,
                maxScore,
                minScore,
                currentRank,
                latestResult: {
                    quizTitle: latestAttempt.quizId?.title || "Untitled Quiz",
                    score: latestAttempt.score,
                    completedAt: latestAttempt.completedAt,
                    status: latestAttempt.status,
                    totalQuestions: latestAttempt.totalQuestions,
                    correctAnswersCount: latestAttempt.correctAnswersCount,
                    timeTakenInSeconds: latestAttempt.timeTaken,
                },
                performanceTrend,
                predictedNextScore,
                weakAreas,
                recentHistory,
                leaderboard,
            },
        });
    } catch (error) {
        next(error);
    }
};