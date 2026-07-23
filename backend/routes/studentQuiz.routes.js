import express from "express";
import {
    startQuizAttempt,
    submitQuizAttempt,
    getStudentAttemptDetails,
    getAllStudentAttempts,
    getStudentAttemptResultSummary,
    getStudentDashboardStats,
} from "../controllers/studentQuiz.controllers.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";
import authMiddleWare, {
    authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// start and end Quiz Endpoint
router.post("/quiz/start",authMiddleWare,authorizeRoles("user"), startQuizAttempt);
router.post("/quiz/submit",authMiddleWare,authorizeRoles("user"), submitQuizAttempt);

// Student Dashboard Endpoint
router.get("/dashboard",authMiddleWare,authorizeRoles("user"), getStudentDashboardStats);

// Student Attempt History Endpoints
router.get("/attempts",authMiddleWare,authorizeRoles("user"), getAllStudentAttempts);
router.get("/attempts/:attemptId", authMiddleWare,authorizeRoles("user"), getStudentAttemptDetails);
router.get("/attempts/:attemptId/result",authMiddleWare,authorizeRoles("user"), getStudentAttemptResultSummary);

export default router;