import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "../config/connectDB.js";
import config from "../config/config.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";
import quizRoutes from "../routes/quiz.routes.js";
import studentQuizRoutes from "../routes/studentQuiz.routes.js";
import { errorHandler } from "../middleware/error.middleware.js";
import questionRoutes from "../routes/question.routes.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";
import instructorDashboardRoutes from "../routes/instructorDashboard.routes.js";
import adminRoutes from "../routes/admin.routes.js";

const app = express();

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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://hoppscotch.io",
  "https://quimora.onrender.com",
  "https://quimora-rho.vercel.app",
];

// CORS Middleware - Option 1: Custom (Already in your code)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Debug log - helps find issues in development
  if (config.nodeENV === "development") {
    console.log(`🌐 ${req.method} ${req.url} - Origin: ${origin || 'No Origin'}`);
  }
  
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    (config.nodeENV === "development" && (origin.includes("localhost") || origin.includes("127.0.0.1")));

  if (isAllowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (origin) {
    console.log(`❌ CORS Blocked: ${origin}`);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cache-Control, Pragma, Expires, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // 204 No Content is better for OPTIONS
  }
  next();
});

// ============================================================
// 3️⃣ ALTERNATIVE: Using CORS Package (Uncomment if custom fails)
// ============================================================
/*
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowed = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://hoppscotch.io",
      "https://quimora.onrender.com",
      "https://quimora-rho.vercel.app",
    ];
    
    if (allowed.includes(origin) || 
        origin.endsWith(".vercel.app") || 
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost")) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
*/

// ============================================================
// 4️⃣ MIDDLEWARE
// ============================================================
app.use(morgan("tiny"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// 5️⃣ API ROUTES
// ============================================================
const apiRouter = express.Router();

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

// Mount the versioned router centrally
app.use(config.apiPrefix, apiRouter);

// ============================================================
// 6️⃣ HEALTH CHECK
// ============================================================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Server works fine",
    environment: config.nodeENV,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 7️⃣ 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================================
// 8️⃣ GLOBAL ERROR HANDLER
// ============================================================
app.use(errorHandler);

// ============================================================
// 9️⃣ START SERVER
// ============================================================
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeENV}`);
  console.log(`📡 API Prefix: ${config.apiPrefix}`);
  console.log(`🔗 Allowed Origins: ${allowedOrigins.join(", ")}`);
  connectDB();
});

export default app;