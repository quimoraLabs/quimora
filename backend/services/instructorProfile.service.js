import InstructorProfile from "../models/instructorProfile.model.js";
import QuizAssignment from "../models/quizAssignment.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Quiz from "../models/quiz.model.js";
import { redisCache } from "../config/redis.js";

export class InstructorProfileService {
  /**
   * Update instructor profile (expertise & bio)
   */
  static async updateProfile(userId, { bio, expertise }) {
    let profile = await InstructorProfile.findOne({ userId });
    if (!profile) {
      profile = new InstructorProfile({ userId });
    }

    if (bio !== undefined) profile.bio = bio;
    if (expertise !== undefined) {
      if (!Array.isArray(expertise) || expertise.length < 1) {
        const error = new Error("Instructor must specify at least 1 area of expertise");
        error.statusCode = 400;
        throw error;
      }
      profile.expertise = expertise;
    }

    await profile.save();
    return profile;
  }

  /**
   * Calculate live assignedQuizCount with Redis cache (TTL: 300s)
   */
  static async getAssignedQuizCount(userId) {
    const cacheKey = `instructor:assigned_count:${userId}`;
    const cachedCount = await redisCache.get(cacheKey);
    if (cachedCount !== null && cachedCount !== undefined) {
      return cachedCount;
    }

    const count = await QuizAssignment.countDocuments({ instructorId: userId });
    await redisCache.set(cacheKey, count, 300);
    return count;
  }

  /**
   * Calculate dynamic distinct totalStudents enrolled for instructor quizzes with Redis cache (TTL: 300s)
   */
  static async getTotalStudentsCount(userId) {
    const cacheKey = `instructor:total_students:${userId}`;
    const cachedCount = await redisCache.get(cacheKey);
    if (cachedCount !== null && cachedCount !== undefined) {
      return cachedCount;
    }

    // Find all active quizzes created or assigned to instructor
    const assignments = await QuizAssignment.find({ instructorId: userId }).select("quizId");
    const quizIds = assignments.map((a) => a.quizId);

    // Also include quizzes created by instructor directly
    const createdQuizzes = await Quiz.find({ createdBy: userId }).select("_id");
    const createdQuizIds = createdQuizzes.map((q) => q._id);

    const allQuizIds = Array.from(new Set([...quizIds, ...createdQuizIds].map(id => id.toString())));

    if (allQuizIds.length === 0) {
      await redisCache.set(cacheKey, 0, 300);
      return 0;
    }

    const distinctStudents = await QuizAttempt.distinct("userId", {
      quizId: { $in: allQuizIds },
      status: "completed",
    });

    const count = distinctStudents.length;
    await redisCache.set(cacheKey, count, 300);
    return count;
  }

  /**
   * Get full instructor profile with dynamic counts
   */
  static async getInstructorProfile(userId) {
    let profile = await InstructorProfile.findOne({ userId });
    if (!profile) {
      profile = await InstructorProfile.create({ userId });
    }

    const assignedQuizCount = await this.getAssignedQuizCount(userId);
    const totalStudents = await this.getTotalStudentsCount(userId);

    const profileObj = profile.toObject ? profile.toObject() : profile;
    profileObj.assignedQuizCount = assignedQuizCount;
    profileObj.totalStudents = totalStudents;

    return profileObj;
  }

  /**
   * Increment totalQuizzes counter
   */
  static async incrementQuizCount(userId) {
    await InstructorProfile.updateOne(
      { userId },
      { $inc: { totalQuizzes: 1 } },
      { upsert: true }
    );
    await this.invalidateAssignedCountCache(userId);
  }

  /**
   * Decrement totalQuizzes counter
   */
  static async decrementQuizCount(userId) {
    await InstructorProfile.updateOne(
      { userId, totalQuizzes: { $gt: 0 } },
      { $inc: { totalQuizzes: -1 } }
    );
    await this.invalidateAssignedCountCache(userId);
  }

  /**
   * Invalidate assignedQuizCount Redis cache key
   */
  static async invalidateAssignedCountCache(userId) {
    await redisCache.del(`instructor:assigned_count:${userId}`);
  }

  /**
   * Invalidate totalStudents Redis cache key
   */
  static async invalidateTotalStudentsCache(userId) {
    await redisCache.del(`instructor:total_students:${userId}`);
  }
}

export default InstructorProfileService;
