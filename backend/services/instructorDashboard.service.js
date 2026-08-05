import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import mongoose from "mongoose";

/**
 * Fetches all instructor dashboard aggregated statistics, activity feeds, and quiz listings.
 * @param {String} instructorId - MongoDB ObjectId of the requesting instructor.
 * @returns {Promise<Object>} Aggregated metrics and structured dashboard feed.
 */
export const fetchInstructorDashboardData = async (instructorId) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

  // 1. Fetch total count of quizzes created by instructor
  const totalQuizzes = await Quiz.countDocuments({
    createdBy: instructorObjectId,
  });

  // 2. Aggregate active students, total attempts, and average score rate
  const globalMetricsPipeline = await QuizAttempt.aggregate([
    {
      $lookup: {
        from: "quizzes",
        localField: "quizId",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    { $match: { "quiz.createdBy": instructorObjectId } },
    {
      $group: {
        _id: null,
        activeStudents: { $addToSet: "$userId" },
        totalAttempts: { $sum: 1 },
        averageScoreRate: { $avg: "$score" },
      },
    },
    {
      $project: {
        _id: 0,
        activeStudentsCount: { $size: "$activeStudents" },
        totalAttempts: 1,
        averageScoreRate: { $round: ["$averageScoreRate", 1] },
      },
    },
  ]);

  const aggregateStats = globalMetricsPipeline[0] || {
    activeStudentsCount: 0,
    totalAttempts: 0,
    averageScoreRate: 0,
  };

  // 3. Fetch recent quizzes with total attempt counts and average scores
  const recentQuizzes = await Quiz.aggregate([
    { $match: { createdBy: instructorObjectId } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "quizattempts",
        localField: "_id",
        foreignField: "quizId",
        as: "attempts",
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "quizId",
        as: "questions",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        totalQuestions: { $size: "$questions" },
        totalAttempts: { $size: "$attempts" },
        avgScore: {
          $let: {
            vars: {
              completedAttempts: {
                $filter: {
                  input: "$attempts",
                  as: "attempt",
                  cond: { $eq: ["$$attempt.status", "completed"] },
                },
              },
            },
            in: {
              $cond: [
                { $gt: [{ $size: "$$completedAttempts" }, 0] },
                { $round: [{ $avg: "$$completedAttempts.score" }, 0] },
                null,
              ],
            },
          },
        },
      },
    },
  ]);

  // 4. Retrieve live student activity feed
  const recentActivities = await QuizAttempt.aggregate([
    {
      $lookup: {
        from: "quizzes",
        localField: "quizId",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    { $match: { "quiz.createdBy": instructorObjectId } },
    { $sort: { updatedAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $project: {
        _id: 1,
        studentName: "$student.name",
        quizTitle: "$quiz.title",
        score: "$score",
        status: "$status",
        updatedAt: 1,
      },
    },
  ]);

  return {
    metrics: {
      totalQuizzes,
      activeStudents: aggregateStats.activeStudentsCount,
      totalAttempts: aggregateStats.totalAttempts,
      avgScoreRate: aggregateStats.averageScoreRate,
    },
    recentQuizzes: recentQuizzes.map((quiz) => ({
      id: quiz._id.toString(),
      title: quiz.title,
      totalQuestions: quiz.totalQuestions,
      attemptsCount: quiz.totalAttempts,
      avgScore: quiz.avgScore !== null ? `${quiz.avgScore}%` : "--",
      status: quiz.status,
    })),
    liveActivities: recentActivities.map((activity) => ({
      id: activity._id.toString(),
      studentName: activity.studentName,
      quizTitle: activity.quizTitle,
      score: activity.score,
      status: activity.status,
      timestamp: activity.updatedAt,
    })),
  };
};
