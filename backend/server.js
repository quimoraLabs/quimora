import express from "express";
import cors from "cors";
import connectDB from './config/connectDB.js';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import questionRoutes from './routes/question.routes.js';
import { validateObjectId } from "./middleware/validObjectId.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz/:quizId/questions",validateObjectId("quizId"), questionRoutes);
// Global error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  connectDB();
});