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
import { getAvailableQuizzesForStudents } from "../controllers/quiz.controllers.js";
import trackProgressionController from "../controllers/trackProgression.controllers.js";
import challengeController from "../controllers/challenge.controllers.js";
import authMiddleWare, {
    authorizeRoles,
    checkStudentOnboarding,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Live Challenges & Contests
router.get("/challenges", authMiddleWare, authorizeRoles("user"), challengeController.getLiveChallenges);
router.get("/challenges/:challengeId/leaderboard", authMiddleWare, authorizeRoles("user"), challengeController.getChallengeLeaderboard);

// Student Tracks & Chapter Progression
router.get("/tracks/:interestId", authMiddleWare, authorizeRoles("user"), checkStudentOnboarding, trackProgressionController.getDomainTrack);
router.get("/tracks/next-challenge/:quizId", authMiddleWare, authorizeRoles("user"), checkStudentOnboarding, trackProgressionController.getNextChallenge);

// Student Quizzes Discovery Endpoint (supports ?interestId=... and ?level=...)
router.get("/quizzes", authMiddleWare, authorizeRoles("user"), getAvailableQuizzesForStudents);

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
