import mongoose from "mongoose";
import QuizAttempt from "../models/quizAttempt.model.js";
import { assertQuizExists } from "../utils/assertion.utils.js";
import { fetchInstructorDashboardData } from "../services/instructorDashboard.service.js";

/**
 * Express Controller to retrieve instructor dashboard analytics feed.
 */
export const getInstructorDashboard = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();
    const dashboardPayload = await fetchInstructorDashboardData(userId);

    return res.status(200).json({
      success: true,
      message: "Instructor dashboard data retrieved successfully",
      data: dashboardPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get students who have attempted quizzes created by the logged-in instructor.
 */
export const getInstructorStudents = async (req, res, next) => {
  try {
    const instructorId = new mongoose.Types.ObjectId(req.auth.userId);

    const students = await QuizAttempt.aggregate([
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quizDetails",
        },
      },
      { $unwind: "$quizDetails" },
      {
        $match: {
          "quizDetails.createdBy": instructorId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: "$score" },
          totalAttempts: { $sum: 1 },
          lastAttemptDate: { $max: "$completedAt" },
          quizzesTaken: { $addToSet: "$quizDetails.title" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$studentInfo.name",
          email: "$studentInfo.email",
          averageScore: { $round: ["$averageScore", 1] },
          totalAttempts: 1,
          lastAttemptDate: 1,
          quizzesTaken: 1,
        },
      },
      { $sort: { lastAttemptDate: -1 } },
    ]);

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions for a specific quiz (Instructor view).
 */
export const getQuizSubmissionsForInstructor = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.auth.userId.toString();

    const quiz = await assertQuizExists(quizId);
    if (quiz.createdBy.toString() !== instructorId && req.auth.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access to this quiz submissions." });
    }

    const attempts = await QuizAttempt.find({ quizId, status: "completed" })
      .populate("userId", "name email")
      .sort({ score: -1, timeTaken: 1 })
      .lean();

    const submissions = attempts.map((att, index) => ({
      attemptId: att._id,
      rank: index + 1,
      studentId: att.userId?._id,
      studentName: att.userId?.name || "Anonymous",
      studentEmail: att.userId?.email || "N/A",
      score: att.score,
      correctAnswersCount: att.correctAnswersCount,
      totalQuestions: att.totalQuestions,
      percentage: Math.round((att.correctAnswersCount / (att.totalQuestions || 1)) * 100),
      timeTaken: att.timeTaken,
      completedAt: att.completedAt || att.updatedAt,
      status: att.status,
    }));

    res.status(200).json({
      success: true,
      message: "Quiz submissions fetched successfully",
      data: {
        quizTitle: quiz.title,
        totalSubmissions: submissions.length,
        submissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single attempt question-by-question review for Instructor.
 */
export const getAttemptReviewForInstructor = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const instructorId = req.auth.userId.toString();

    const attempt = await QuizAttempt.findById(attemptId)
      .populate("quizId", "title createdBy timeLimit")
      .populate("userId", "name email")
      .lean();

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found." });
    }

    if (
      attempt.quizId?.createdBy?.toString() !== instructorId &&
      req.auth.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this attempt review." });
    }

    res.status(200).json({
      success: true,
      message: "Attempt review retrieved successfully",
      data: {
        attemptId: attempt._id,
        student: {
          name: attempt.userId?.name,
          email: attempt.userId?.email,
        },
        quiz: {
          title: attempt.quizId?.title,
          timeLimit: attempt.quizId?.timeLimit,
        },
        score: attempt.score,
        correctAnswersCount: attempt.correctAnswersCount,
        totalQuestions: attempt.totalQuestions,
        timeTaken: attempt.timeTaken,
        completedAt: attempt.completedAt,
        questionSnapshots: attempt.questionSnapshots,
        answers: attempt.answers,
      },
    });
  } catch (error) {
    next(error);
  }
};
