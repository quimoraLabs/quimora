import express from "express";
import {
    startQuizAttempt,
    saveQuizDraft,
    submitQuizAttempt,
    getStudentAttemptDetails,
    getStudentAttemptHistory,
    getStudentAttemptResultSummary,
    getStudentDashboardStats,
    getStudentQuizWiseLeaderboard,
    checkStudentQuizEligibility,
} from "../controllers/studentQuiz.controllers.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";
import authMiddleWare, {
    authorizeRoles,
    checkStudentOnboarding,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// eligibility,start and end Quiz Endpoint
router.get("/quiz/:quizId/eligibility", authMiddleWare, authorizeRoles("user"), checkStudentOnboarding, checkStudentQuizEligibility);
router.post("/quiz/start", authMiddleWare, authorizeRoles("user"), checkStudentOnboarding, startQuizAttempt);
router.patch("/quiz/save-draft", authMiddleWare, authorizeRoles("user"), checkStudentOnboarding, saveQuizDraft);
router.post("/quiz/submit", authMiddleWare, authorizeRoles("user"), checkStudentOnboarding, submitQuizAttempt);

// Student Dashboard Endpoint (accessible to new students so onboarding modal can open cleanly)
router.get("/dashboard", authMiddleWare, authorizeRoles("user"), getStudentDashboardStats);
router.get("/leaderboard/quiz/:quizId", authMiddleWare, authorizeRoles("user"), getStudentQuizWiseLeaderboard);

// Student Attempt History Endpoints
router.get("/attempts", authMiddleWare, authorizeRoles("user"), getStudentAttemptHistory);
router.get("/attempts/:attemptId", authMiddleWare, authorizeRoles("user"), getStudentAttemptDetails);
router.get("/attempts/:attemptId/result", authMiddleWare, authorizeRoles("user"), getStudentAttemptResultSummary);

export default router;