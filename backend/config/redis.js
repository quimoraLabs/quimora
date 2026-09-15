import Redis from "ioredis";
import config from "./config.js";

let redisClient = null;
let isRedisConnected = false;

const redisUri = process.env.REDIS_URI || "redis://localhost:6379";

try {
  redisClient = new Redis(redisUri, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts in local fallback mode
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true,
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("⚡ [REDIS] Connected to Redis Cache Server successfully");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    // Suppress spammy log output during fallback execution
  });

  // Attempt initial async connection
  redisClient.connect().catch(() => {
    isRedisConnected = false;
    console.log("ℹ️ [REDIS] Local Redis server not running. Falling back gracefully to direct MongoDB queries.");
  });
} catch (error) {
  isRedisConnected = false;
  console.log("ℹ️ [REDIS] Redis client initialization skipped. Direct DB fallback active.");
}

/**
 * Cache Helper Utility with Graceful DB Fallback
 */
export const redisCache = {
  async get(key) {
    if (!isRedisConnected || !redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    if (!isRedisConnected || !redisClient) return false;
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch {
      return false;
    }
  },

  async del(key) {
    if (!isRedisConnected || !redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch {
      return false;
    }
  },

  isConnected() {
    return isRedisConnected;
  },
};

export default redisClient;
