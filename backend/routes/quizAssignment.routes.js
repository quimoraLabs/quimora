import express from "express";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import {
  assignQuizToInstructor,
  getInstructorAssignedQuizzes,
  getQuizAssignedInstructor,
  recordStudentConsent,
} from "../controllers/quizAssignment.controllers.js";

const router = express.Router();

// Public/Student: Get assigned instructor details for pre-quiz transparency
router.get("/quizzes/:quizId/assigned-instructor", getQuizAssignedInstructor);

// Student: Give pre-quiz telemetry consent
router.post(
  "/student/quiz/:quizId/consent",
  authMiddleware,
  authorizeRoles("user"),
  recordStudentConsent
);

// Instructor/Admin: Assign instructor to a quiz
router.post(
  "/instructor/quizzes/:quizId/assign",
  authMiddleware,
  authorizeRoles("instructor", "admin"),
  assignQuizToInstructor
);

// Instructor: Get all quizzes assigned to me
router.get(
  "/instructor/quizzes/assigned",
  authMiddleware,
  authorizeRoles("instructor"),
  getInstructorAssignedQuizzes
);

export default router;
