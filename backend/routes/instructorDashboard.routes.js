import { Router } from "express";
import { getInstructorDashboard } from "../controllers/instructorDashboard.controllers.js";
import {
  getInstructorStudents,
  getQuizSubmissionsForInstructor,
  getAttemptReviewForInstructor,
} from "../controllers/attemptQuiz.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";

const router = Router();

// Endpoint for fetching dashboard analytics payload
router.get("/dashboard", authMiddleware, authorizeRoles("instructor"), getInstructorDashboard);

// Endpoint for fetching students who took instructor's quizzes
router.get("/students", authMiddleware, authorizeRoles("instructor"), getInstructorStudents);

// Endpoint for fetching submissions/leaderboard for a specific quiz
router.get(
  "/submissions/:quizId",
  validateObjectId("quizId"),
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  getQuizSubmissionsForInstructor
);

// Endpoint for reviewing detailed question-by-question attempt sheet
router.get(
  "/review/:attemptId",
  validateObjectId("attemptId"),
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  getAttemptReviewForInstructor
);

// Endpoint for generating questions using Groq AI
import { generateAIQuestions } from "../controllers/aiQuestion.controllers.js";
router.post(
  "/ai/generate-questions",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  generateAIQuestions
);

export default router;
