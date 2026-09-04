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
import instructorDashboardRoutes from "../routes/instructorDashboard.routes.js"
import adminRoutes from "../routes/admin.routes.js"

const app = express();
if (config.nodeENV !== "production") {
  app.set("etag", false);
  console.log("Development Mode: ETags disabled (Status 200 forced)");
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://hoppscotch.io",
  "https://quimora-rho.vercel.app"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, mobile, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".onrender.com") ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, origin);
    }
    return callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());


// Create a versioned router
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

app.get("/", (req, res) => {
  res.send("server works fine");
});

// Global error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  connectDB();
});
