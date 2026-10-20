import Level from "../models/level.model.js";
import { redisCache } from "../config/redis.js";

const CACHE_KEY = "system:level_thresholds";
const CACHE_TTL_SECONDS = 3600; // 1 hour

export class LevelMappingService {
  /**
   * Fetch all level tier definitions with Redis caching
   */
  static async getAllLevels() {
    const cachedLevels = await redisCache.get(CACHE_KEY);
    if (cachedLevels && Array.isArray(cachedLevels) && cachedLevels.length > 0) {
      return cachedLevels;
    }

    const levels = await Level.find({}).sort({ minElo: 1 });
    if (levels && levels.length > 0) {
      await redisCache.set(CACHE_KEY, levels, CACHE_TTL_SECONDS);
    }
    return levels;
  }

  /**
   * Derive level details for a given Elo rating score
   */
  static async getLevelForElo(rating) {
    const safeRating = Math.max(0, rating || 0);
    const levels = await this.getAllLevels();

    if (!levels || levels.length === 0) {
      // Fallback defaults if Level collection is not seeded
      if (safeRating < 1000) return { levelName: "Beginner", badge: "badge_beginner.png" };
      if (safeRating < 1200) return { levelName: "Learner", badge: "badge_learner.png" };
      if (safeRating < 1400) return { levelName: "Intermediate", badge: "badge_intermediate.png" };
      if (safeRating < 1600) return { levelName: "Advanced", badge: "badge_advanced.png" };
      if (safeRating < 1800) return { levelName: "Master", badge: "badge_master.png" };
      return { levelName: "Expert", badge: "badge_expert.png" };
    }

    const matchedLevel = levels.find(
      (lvl) => safeRating >= lvl.minElo && safeRating < lvl.maxElo
    );

    if (matchedLevel) {
      return matchedLevel;
    }

    // If rating exceeds highest tier maxElo
    const highestLevel = levels[levels.length - 1];
    return highestLevel || { levelName: "Expert", badge: "badge_expert.png" };
  }

  /**
   * Invalidate level thresholds Redis cache key (e.g. after admin updates)
   */
  static async invalidateLevelCache() {
    await redisCache.del(CACHE_KEY);
  }
}

export default LevelMappingService;
