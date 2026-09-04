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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cache-Control, Pragma, Expires, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
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
