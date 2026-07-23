import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import {
  assertUserExists,
  assertQuizExists,
} from "../utils/assertion.utils.js";
import { formatUniversalResponse } from "../utils/universalFormatter.utils.js";

/**
 * Initializes a secure quiz taking session for an authorized user profile.
 */

export const startQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    const userId = req.auth.userId.toString();

    // 1. Fetch Parent Quiz
    const quiz = await assertQuizExists(quizId);

    // 2. Status & Availability Checks
    if (quiz.status !== "published" || !quiz.isActive) {
      return res.status(400).json({
        error: "This quiz is currently unavailable for testing",
      });
    }

    // 3. Date Boundary Checks (Schedule Window)
    const now = new Date();
    if (quiz.startDate && now < new Date(quiz.startDate)) {
      return res.status(400).json({ error: "Quiz session has not started yet" });
    }
    if (quiz.endDate && now > new Date(quiz.endDate)) {
      return res.status(400).json({ error: "Quiz session has expired" });
    }

    // 4. Maximum Attempts Limit Check
    if (quiz.maxAttempts && quiz.maxAttempts > 0) {
      const pastAttemptsCount = await QuizAttempt.countDocuments({
        userId,
        quizId,
        status: "completed",
      });

      if (pastAttemptsCount >= quiz.maxAttempts) {
        return res.status(403).json({
          error: `You have exhausted your maximum allotment of ${quiz.maxAttempts} attempts for this quiz`,
        });
      }
    }

    // 5. Check if User Already Has an Ongoing Active Attempt
    let attempt = await QuizAttempt.findOne({
      userId,
      quizId,
      status: "started",
    });

    // 6. Fetch Questions from Separated Question Collection
    const rawQuestions = await Question.find({ quizId }).lean();

    if (!rawQuestions || rawQuestions.length === 0) {
      return res.status(400).json({
        error: "Cannot start a quiz that contains no active questions",
      });
    }

    // Create new attempt only if an ongoing one doesn't exist
    if (!attempt) {
      attempt = await QuizAttempt.create({
        userId,
        quizId,
        totalQuestions: rawQuestions.length,
        status: "started",
        startedAt: new Date(),
      });
    }

    // 7. SECURITY: Sanitize Questions for Student (Strip correct answers / flags)
    const secureQuestions = rawQuestions.map((q) => {
      return {
        _id: q._id,
        questionText: q.questionText,
        marks: q.marks,
        difficulty: q.difficulty,
        // Strip `isCorrect` from options array if present in your Question schema
        options: q.options ? q.options.map((opt) => ({
          _id: opt._id,
          optionText: opt.optionText || opt.text,
        })) : [],
      };
    });

    // 8. Return Payload
    res.status(200).json({
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
          questions: secureQuestions,
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
    // const { attemptId } = req.params;
    const { answers: userAnswers, attemptId } = req.body; // Expects array of { questionId, selectedOptions }
    const userId = req.auth.userId;

    // 1. Core State Guard: Verify attempt presence and context ownership
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res
        .status(404)
        .json({ error: "Active quiz attempt session not found" });
    }

    if (attempt.status !== "started") {
      return res
        .status(400)
        .json({ error: "This quiz session has already been processed" });
    }

    // 2. Structural Layer Validation: Hydrate master schema record parameters
    const quiz = await Quiz.findById(attempt.quizId).select(
      "+questions.options.isCorrect",
    );
    if (!quiz) {
      return res
        .status(404)
        .json({ error: "The origin quiz for this session no longer exists" });
    }

    // 3. Time Constraints Verification Block
    const timeSpentInSeconds = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000,
    );
    const serverBufferInSeconds = 15;

    if (quiz.timeLimit && quiz.timeLimit > 0) {
      const maximumAllowedSeconds = quiz.timeLimit * 60 + serverBufferInSeconds;
      if (timeSpentInSeconds > maximumAllowedSeconds) {
        attempt.status = "abandoned";
        await attempt.save();
        return res.status(400).json({
          error:
            "Submission rejected: The time limit allocated for this session has expired",
        });
      }
    }

    if (!Array.isArray(userAnswers)) {
      return res.status(400).json({
        error: "Malformatted payload: Answers field must be a valid array",
      });
    }

    // 4. ANTI-CHEAT LAYER: Map master IDs using a secure key collection lookup string
    const masterQuestionIds = new Set(
      quiz.questions.map((q) => q._id.toString()),
    );

    for (const ans of userAnswers) {
      if (ans.questionId === undefined || ans.questionId === null) {
        return res.status(400).json({
          error:
            "Malformatted payload: Each submission element requires a 'questionId'",
        });
      }

      const submittedIdStr = ans.questionId.toString().trim();
      if (!masterQuestionIds.has(submittedIdStr)) {
        return res.status(400).json({
          error: `Security Violation: Question ID '${submittedIdStr}' does not match this quiz scope`,
        });
      }
    }

    // Map user answers using O(1) optimization key mapping variables
    const userAnswersMap = new Map();
    userAnswers.forEach((ans) => {
      userAnswersMap.set(ans.questionId.toString().trim(), ans.selectedOptions);
    });

    let correctAnswersCount = 0;
    const compiledSnapshotArray = [];

    // GRADING ENGINE
    for (const masterQuestion of quiz.questions) {
      const qIdString = masterQuestion._id.toString();
      const rawUserSelection = userAnswersMap.get(qIdString);

      // Handle structural scenarios where questions are completely un-attempted or skipped
      if (
        rawUserSelection === undefined ||
        rawUserSelection === null ||
        (Array.isArray(rawUserSelection) && rawUserSelection.length === 0)
      ) {
        compiledSnapshotArray.push({
          questionId: masterQuestion._id,
          selectedOptions: ["-1"], // Default to skipped state indicators
          isCorrect: false,
          timeSpent: 0,
        });
        continue;
      }

      // FIX: Extract element safely since frontend passes an array of stringified numbers
      const primarySelection = Array.isArray(rawUserSelection)
        ? rawUserSelection[0]
        : rawUserSelection;
      let sanitizedIndex = Number(primarySelection);

      if (
        isNaN(sanitizedIndex) ||
        primarySelection === "" ||
        rawUserSelection === null
      ) {
        sanitizedIndex = -1;
      }

      // 6. DYNAMIC INDEX EXTRACTION: Locate the correct answer index from your native option objects
      const masterCorrectIndex = masterQuestion.options.findIndex(
        (opt) => opt.isCorrect === true,
      );

      // Evaluate accuracy strictly by validating bounds and checking structural matching positions
      const isCorrect =
        sanitizedIndex !== -1 && sanitizedIndex === masterCorrectIndex;

      if (isCorrect) {
        correctAnswersCount++;
      }

      compiledSnapshotArray.push({
        questionId: masterQuestion._id,
        selectedOptions: [sanitizedIndex.toString()],
        isCorrect,
        timeSpent: 0,
      });
    }

    // 7. Security Size Validation Bounds Verification Check
    if (userAnswersMap.size > quiz.questions.length) {
      return res.status(400).json({
        error:
          "Security Violation: Injected properties detected inside your payload data",
      });
    }

    // 8. Compile and finalize aggregate metrics calculations
    const scorePercentage = (correctAnswersCount / quiz.questions.length) * 100;

    attempt.correctAnswersCount = correctAnswersCount;
    attempt.score = parseFloat(scorePercentage.toFixed(2));
    attempt.answers = compiledSnapshotArray;
    attempt.timeTaken = timeSpentInSeconds;
    attempt.status = "completed";
    attempt.completedAt = Date.now();

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz session evaluated and processed successfully",
      summary: {
        title: quiz.title,
        totalQuestions: quiz.questions.length,
        correctAnswersCount,
        score: attempt.score,
        timeTakenInSeconds: timeSpentInSeconds,
        status: attempt.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizAttemptDetails = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.auth.userId;

    // This will now populate correctly and cleanly.
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
      .populate({
        path: "quizId",
        select: "title",
      })
      .populate({
        path: "userId",
        select: "name email",
      });

    if (!attempt) {
      return res
        .status(404)
        .json({ error: "Quiz attempt session not found for this user" });
    }

    const result = formatUniversalResponse([attempt], "userId", [
      "name",
      "email",
    ]);

    res.status(200).json({
      success: true,
      attemptDetails: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuizAttemptsForUser = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const attempts = await QuizAttempt.find({ userId })
      .sort({ startedAt: -1 })
      .populate({
        path: "quizId",
        select: "title",
      })
      .populate({
        path: "userId",
        select: "name email",
      });

    if (!attempts) {
      return res
        .status(404)
        .json({ error: "Quiz attempt session not found for this user" });
    }

    const result = formatUniversalResponse(attempts, "userId", [
      "name",
      "email",
    ]);

    res.status(200).json({
      success: true,
      attempts: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizAttemptResults = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.auth.userId;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res
        .status(404)
        .json({ error: "Quiz attempt session not found for this user" });
    }

    res.status(200).json({
      success: true,
      quizResults: {
        id: attempt._id,
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount: attempt.correctAnswersCount,
        score: attempt.score,
        timeTakenInSeconds: attempt.timeTaken,
        status: attempt.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDashboardStats = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    const completedAttempts = await QuizAttempt.find({
      userId,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .populate({ path: "quizId", select: "title tags" })
      .lean();

    if (!completedAttempts || completedAttempts.length === 0) {
      return res.status(200).json({
        success: true,
        dashboard: {
          totalTestsTaken: 0,
          averageScore: 0,
          maxScore: 0,
          minScore: 0,
          currentRank: null,
          latestResult: null,
          performanceTrend: [],
          predictedNextScore: null,
          weakAreas: [],
          recentHistory: [],
          leaderboard: [],
        },
      });
    }

    const totalTestsTaken = completedAttempts.length;
    const scores = completedAttempts.map((attempt) => attempt.score);
    const averageScore = parseFloat(
      (scores.reduce((sum, score) => sum + score, 0) / totalTestsTaken).toFixed(2),
    );
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    const latestAttempt = completedAttempts[0];
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

    const predictedNextScore = (() => {
      if (performanceTrend.length <= 1) {
        return performanceTrend[0]?.score ?? averageScore;
      }
      const firstScore = performanceTrend[0].score;
      const lastScore = performanceTrend[performanceTrend.length - 1].score;
      const slope = (lastScore - firstScore) / (performanceTrend.length - 1);
      return Number(Math.min(100, Math.max(0, lastScore + slope)).toFixed(1));
    })();

    const tagBuckets = completedAttempts.reduce((acc, attempt) => {
      const tags = Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [];
      tags.forEach((tag) => {
        const tagKey = typeof tag === 'object' ? tag.toString() : tag;
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
    ]);

    const rankPipeline = await QuizAttempt.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: "$score" },
          totalTests: { $sum: 1 },
        },
      },
      { $sort: { averageScore: -1, totalTests: -1 } },
      {
        $project: {
          userId: "$_id",
          averageScore: 1,
          totalTests: 1,
        },
      },
    ]);

    const currentRank =
      rankPipeline.findIndex((entry) => entry.userId.toString() === userId) + 1 ||
      null;

    const leaderboard = globalLeaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      averageScore: entry.averageScore,
      totalTests: entry.totalTests,
      isMe: entry.userId.toString() === userId,
    }));

    res.status(200).json({
      success: true,
      dashboard: {
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

// Controller to get a high-level summary of all quiz participants
export const getGlobalQuizAnalytics = async (req, res, next) => {
  try {
    const quizStats = await QuizAttempt.aggregate([
      // Only consider completed quizzes for accurate analytics
      { $match: { status: "completed" } },
      
      // Grouping by student to see their individual performance
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: "$score" },
          totalAttempts: { $sum: 1 },
          lastAttemptDate: { $max: "$completedAt" },
        },
      },
      
      // Connecting to the Users collection to get participant names
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      { $unwind: "$participant" },
      
      // Selecting only relevant quiz-taker info
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$participant.name",
          averageScore: { $round: ["$averageScore", 2] },
          totalAttempts: 1,
          lastAttemptDate: 1,
        },
      },
      
      // Sorting by performance
      { $sort: { averageScore: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: quizStats,
    });
  } catch (error) {
    next(error);
  }
};

// Get students who have attempted quizzes created by the logged-in instructor
export const getInstructorStudents = async (req, res, next) => {
  try {
    const instructorId = req.auth.userId;

    const students = await QuizAttempt.aggregate([
      // 1. Join with Quizzes to filter by instructor
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quizDetails"
        }
      },
      { $unwind: "$quizDetails" },
      
      // 2. Filter: Only students who took this instructor's quizzes
      { $match: { "quizDetails.instructorId": instructorId, status: "completed" } },
      
      // 3. Group by student to get individual stats
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: "$score" },
          totalAttempts: { $sum: 1 },
          lastAttemptDate: { $max: "$completedAt" }
        }
      },
      
      // 4. Get student details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      
      // 5. Final projection
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$studentInfo.name",
          averageScore: { $round: ["$averageScore", 2] },
          totalAttempts: 1,
          lastAttemptDate: 1
        }
      }
    ]);

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};