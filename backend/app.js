import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "./config/config.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import studentQuizRoutes from "./routes/studentQuiz.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import questionRoutes from "./routes/question.routes.js";
import { validateObjectId } from "./middleware/validObjectId.middleware.js";
import instructorDashboardRoutes from "./routes/instructorDashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import interestRoutes from "./routes/interest.routes.js";
import levelRoutes from "./routes/level.routes.js";
import quizAssignmentRoutes from "./routes/quizAssignment.routes.js";
import rewardsRoutes from "./routes/rewards.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import hierarchyRoutes from "./routes/hierarchy.routes.js";
import { redisCache } from "./config/redis.js";

const app = express();

// Trust reverse proxy (Render, Vercel, Nginx, Cloudflare) for accurate client IP rate limiting
app.set("trust proxy", 1);

// ============================================================
// 1️⃣ ETAG DISABLE (Development only)
// ============================================================ 
if (config.nodeENV !== "production") {
  app.set("etag", false);
  console.log("🔧 Development Mode: ETags disabled");
}

// ============================================================
// 2️⃣ CORS CONFIGURATION - COMPLETE FIX
// ============================================================
export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://hoppscotch.io",
  "https://quimora.onrender.com",
  "https://quimora-rho.vercel.app",
];

// CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Debug log - helps find issues in development
  if (config.nodeENV === "development") {
    console.log(`🌐 ${req.method} ${req.url} - Origin: ${origin || "No Origin"}`);
  }

  const isVercelOrigin = origin && (origin.endsWith(".vercel.app") || origin.includes("quimora"));
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) ||
    isVercelOrigin ||
    (config.nodeENV === "development" && (origin.includes("localhost") || origin.includes("127.0.0.1")));

  if (isAllowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cache-Control, Pragma, Expires, X-Requested-With"
    );
    res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
  } else if (origin) {
    console.log(`❌ CORS Blocked: ${origin}`);
    if (req.method === "OPTIONS") {
      return res.status(403).end();
    }
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// ============================================================
// 3️⃣ MIDDLEWARE & SECURITY HEADERS
// ============================================================
app.use(helmet({ contentSecurityPolicy: false }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// 4️⃣ API ROUTES & HEALTH CHECK
// ============================================================
const apiRouter = express.Router();

// Health check handler (unprotected, genuine DB & Redis status)
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? "ok" : "degraded";
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    database: isDbConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.nodeENV,
    redis: redisCache.isConnected() ? "connected" : "fallback_mode",
  });
};

app.get("/", healthHandler);
app.get("/health", healthHandler);
apiRouter.get("/health", healthHandler);

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/quizzes", quizRoutes);
apiRouter.use("/student", studentQuizRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use(
  "/quiz/:quizId/questions",
  validateObjectId("quizId"),
  questionRoutes
);
apiRouter.use("/instructor", instructorDashboardRoutes);
apiRouter.use("/interests", interestRoutes);
apiRouter.use("/levels", levelRoutes);
apiRouter.use("/", quizAssignmentRoutes);
apiRouter.use("/rewards", rewardsRoutes);
apiRouter.use("/student/rewards", rewardsRoutes);
apiRouter.use("/practice", practiceRoutes);
apiRouter.use("/hierarchy", hierarchyRoutes);

// Mount the versioned router centrally (supports both /api/v2 and legacy /api/v1)
app.use(config.apiPrefix, apiRouter);
if (config.apiPrefix !== "/api/v1") {
  app.use("/api/v1", apiRouter);
}

// ============================================================
// 5️⃣ 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================================
// 7️⃣ GLOBAL ERROR HANDLER
// ============================================================
app.use(errorHandler);

export default app;
