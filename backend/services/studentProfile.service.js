import StudentProfile from "../models/studentProfile.model.js";
import Interest from "../models/interest.model.js";
import EloRating from "../models/eloRating.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { redisCache } from "../config/redis.js";

export class StudentProfileService {
  /**
   * Complete initial student interest onboarding (requires 5-6 interests)
   */
  static async completeOnboarding(userId, interestIds) {
    if (!Array.isArray(interestIds) || interestIds.length < 1 || interestIds.length > 10) {
      const error = new Error("Please select at least 1 interest (up to 10)");
      error.statusCode = 400;
      throw error;
    }

    // Verify all interest IDs exist and are active
    const validInterests = await Interest.find({ _id: { $in: interestIds }, isActive: true });
    if (validInterests.length !== interestIds.length) {
      const error = new Error("One or more selected interests are invalid or inactive");
      error.statusCode = 400;
      throw error;
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId });
    }

    profile.interests = interestIds;
    profile.onboardingCompleted = true;
    await profile.save();

    // Initialize EloRating records for selected interests
    for (const interestId of interestIds) {
      await EloRating.findOneAndUpdate(
        { studentId: userId, interestId },
        {
          $setOnInsert: {
            rating: 1000,
            highestRating: 1000,
            quizzesAttempted: 0,
          },
          $set: { isArchived: false, lastUpdated: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    // Invalidate cached quizzes for this student so feed updates instantly
    await redisCache.delPattern(`quizzes:student:${userId}:*`);

    return profile;
  }

  /**
   * Update student interests post-onboarding (hard cap = 10)
   */
  static async updateInterests(userId, interestIds) {
    if (!Array.isArray(interestIds)) {
      const error = new Error("interestIds must be an array");
      error.statusCode = 400;
      throw error;
    }

    if (interestIds.length > 10) {
      const error = new Error("Student cannot select more than 10 interests");
      error.statusCode = 400;
      throw error;
    }

    const validInterests = await Interest.find({ _id: { $in: interestIds }, isActive: true });
    if (validInterests.length !== interestIds.length) {
      const error = new Error("One or more selected interests are invalid or inactive");
      error.statusCode = 400;
      throw error;
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    const oldInterests = profile.interests.map((id) => id.toString());
    const newInterests = interestIds.map((id) => id.toString());

    profile.interests = interestIds;
    await profile.save();

    // Archive removed interests
    const removedInterests = oldInterests.filter((id) => !newInterests.includes(id));
    if (removedInterests.length > 0) {
      await EloRating.updateMany(
        { studentId: userId, interestId: { $in: removedInterests } },
        { $set: { isArchived: true, lastUpdated: new Date() } }
      );
    }

    // Un-archive / initialize new interests (preserving Elo)
    for (const interestId of newInterests) {
      await EloRating.findOneAndUpdate(
        { studentId: userId, interestId },
        {
          $setOnInsert: {
            rating: 1000,
            highestRating: 1000,
            quizzesAttempted: 0,
          },
          $set: { isArchived: false, lastUpdated: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    // Invalidate cached quizzes for this student so feed updates instantly
    await redisCache.delPattern(`quizzes:student:${userId}:*`);

    return profile;
  }

  /**
   * Record completed quiz submission (atomically updates counter & timestamps within transaction)
   */
  static async recordQuizSubmission(userId, quizId, options = {}) {
    const session = options.session || null;

    let profile = await StudentProfile.findOne({ userId }).session(session);
    if (!profile) {
      profile = await StudentProfile.create([{ userId }], { session });
      profile = profile[0];
    }

    // Check if this is the first completed attempt for this quizId
    const previousCompleted = await QuizAttempt.countDocuments({
      userId: userId,
      quizId: quizId,
      status: "completed",
    }).session(session);

    const isFirstAttemptForQuiz = previousCompleted === 0;

    const updateOps = {
      $inc: { totalAttempts: 1 },
      $set: { lastAttemptAt: new Date() },
    };

    if (isFirstAttemptForQuiz) {
      updateOps.$inc.totalQuizzesAttempted = 1;
    }

    await StudentProfile.updateOne({ userId }, updateOps, { session });
    return true;
  }

  /**
   * Fetch complete student profile with active Elo ratings
   */
  static async getStudentProfile(userId) {
    let profile = await StudentProfile.findOne({ userId }).populate("interests");
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    const eloRatings = await EloRating.find({
      studentId: userId,
      isArchived: false,
    }).populate("interestId");

    return {
      profile,
      eloRatings,
    };
  }
}

export default StudentProfileService;
