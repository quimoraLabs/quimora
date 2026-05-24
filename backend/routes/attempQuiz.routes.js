import express from "express";
import {
  getAllQuizAttemptsForUser,
  getQuizAttemptResults,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttemptDetails,
  getUserDashboardStats,
  //   getAttemptHistory
} from "../controllers/attemptQuiz.controllers.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";
import authMiddleWare, {
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Attempt Operations Layer
router.post("/start", authMiddleWare, authorizeRoles("user"), startQuizAttempt);
router.post(
  "/submit",
  authMiddleWare,
  authorizeRoles("user"),
  submitQuizAttempt,
);
router.get("/my-results", authMiddleWare, authorizeRoles("user"), getAllQuizAttemptsForUser);
router.get("/results/:attemptId", authMiddleWare, authorizeRoles("user"), getQuizAttemptResults);

// Analytics & Dashboard Processing Layer
router.get(
  "/dashboard/stats",
  authMiddleWare,
  authorizeRoles("user"),
  getUserDashboardStats,
);

export default router;
