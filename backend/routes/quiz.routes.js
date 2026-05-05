import express from "express";
import {
  createQuiz,
  getQuizById,
  getQuizzes,
  updateQuiz,
  changeQuizStatus,
  changeQuizActivity,
  deleteQuiz,
  getAllQuizzes,
} from "../controllers/quiz.controllers.js";
import authMiddleware, {
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("instructor"), createQuiz);
router.get("/", authMiddleware, getQuizzes);
router.get("/all", authMiddleware, authorizeRoles("admin"), getAllQuizzes);
router.get("/:quizId", validateObjectId("quizId"), authMiddleware, getQuizById);
router.patch(
  "/:quizId",
  validateObjectId("quizId"),
  authMiddleware,
  authorizeRoles("instructor"),
  updateQuiz,
);
router.patch(
  "/:quizId/status",
  validateObjectId("quizId"),
  authMiddleware,
  authorizeRoles("instructor"),
  changeQuizStatus,
);
router.patch(
  "/:quizId/activity",
  validateObjectId("quizId"),
  authMiddleware,
  authorizeRoles("instructor"),
  changeQuizActivity,
);
router.delete(
  "/:quizId",
  validateObjectId("quizId"),
  authMiddleware,
  authorizeRoles("instructor","admin"),
  deleteQuiz,
);

export default router;
