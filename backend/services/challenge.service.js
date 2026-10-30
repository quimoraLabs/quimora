import mongoose from "mongoose";
import Challenge from "../models/challenge.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

/**
 * Service handling Live Contests, Weekly Sprints, and Monthly Cups.
 */
class ChallengeService {
  /**
   * Fetches active and upcoming challenges.
   */
  async getLiveChallenges() {
    const now = new Date();
    // Return challenges active now or scheduled in the next 14 days
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const challenges = await Challenge.find({
      isLive: true,
      endTime: { $gte: now },
      startTime: { $lte: twoWeeksLater },
    })
      .populate("interestId", "name slug color")
      .populate("quizId", "title timeLimit questions passingScore")
      .sort({ startTime: 1 })
      .lean();

    return challenges.map((c) => {
      const cDate = new Date();
      let dynamicStatus = "upcoming";
      if (cDate >= new Date(c.startTime) && cDate <= new Date(c.endTime)) {
        dynamicStatus = "active";
      } else if (cDate > new Date(c.endTime)) {
        dynamicStatus = "ended";
      }

      return {
        _id: c._id,
        title: c.title,
        description: c.description,
        type: c.type,
        interest: c.interestId,
        quiz: c.quizId,
        startTime: c.startTime,
        endTime: c.endTime,
        prizeDescription: c.prizeDescription,
        status: dynamicStatus,
      };
    });
  }

  /**
   * Fetches leaderboard for a specific challenge.
   */
  async getChallengeLeaderboard(challengeId) {
    const challenge = await Challenge.findById(challengeId).lean();
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    // Aggregate attempts on this quiz submitted within challenge window
    const topAttempts = await QuizAttempt.aggregate([
      {
        $match: {
          quizId: challenge.quizId,
          submittedAt: { $gte: challenge.startTime, $lte: challenge.endTime },
        },
      },
      {
        $sort: { score: -1, durationMinutes: 1, submittedAt: 1 },
      },
      {
        $group: {
          _id: "$userId",
          bestScore: { $first: "$score" },
          bestDuration: { $first: "$durationMinutes" },
          submittedAt: { $first: "$submittedAt" },
          attemptId: { $first: "$_id" },
        },
      },
      {
        $sort: { bestScore: -1, bestDuration: 1 },
      },
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
          userId: "$_id",
          name: "$user.name",
          username: "$user.username",
          avatar: "$user.avatar",
          score: "$bestScore",
          durationMinutes: "$bestDuration",
          submittedAt: 1,
        },
      },
    ]);

    return {
      challenge: {
        _id: challenge._id,
        title: challenge.title,
        type: challenge.type,
        startTime: challenge.startTime,
        endTime: challenge.endTime,
      },
      leaderboard: topAttempts.map((entry, idx) => ({
        rank: idx + 1,
        ...entry,
      })),
    };
  }
}

export const challengeService = new ChallengeService();
export default challengeService;

