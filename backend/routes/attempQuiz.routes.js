import express from "express";
import {
  getAllQuizAttemptsForUser,
  getQuizAttemptResults,
  startQuizAttempt,
  submitQuizAttempt,
  //   getUserDashboardStats,
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
router.get("/results", authMiddleWare, authorizeRoles("user"), getAllQuizAttemptsForUser);
router.get("/results/:attemptId", authMiddleWare, authorizeRoles("user"), getQuizAttemptResults);

// Analytics & Dashboard Processing Layer
// router.get("/dashboard/stats", getUserDashboardStats);
// router.get("/dashboard/history", getAttemptHistory);

export default router;
