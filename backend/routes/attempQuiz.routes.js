import express from "express";
import { 
  startQuizAttempt, 
  submitQuizAttempt, 
//   getUserDashboardStats, 
//   getAttemptHistory 
} from "../controllers/attemptQuiz.controllers.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js"
import authMiddleWare, { authorizeRoles } from "../middleware/auth.middleware.js"

const router = express.Router();

// Attempt Operations Layer
router.post("/quizzes/:quizId/start",authMiddleWare,authorizeRoles("user"), validateObjectId("quizId"), startQuizAttempt);
router.post("/attempts/:attemptId/submit",authMiddleWare,authorizeRoles("user"), validateObjectId("attemptId"), submitQuizAttempt);

// Analytics & Dashboard Processing Layer
// router.get("/dashboard/stats", getUserDashboardStats);
// router.get("/dashboard/history", getAttemptHistory);

export default router;
