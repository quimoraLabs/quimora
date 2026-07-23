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

const app = express();
if (config.nodeENV !== "production") {
  app.set("etag", false);
  console.log("Development Mode: ETags disabled (Status 200 forced)");
}

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://quimorabackend.vercel.app"
      : ["http://localhost:5173","https://hoppscotch.io"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());


// Create a versioned router
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/quizzes", quizRoutes);
apiRouter.use("/student", studentQuizRoutes);
apiRouter.use(
  "/quiz/:quizId/questions",
  validateObjectId("quizId"),
  questionRoutes
);

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
