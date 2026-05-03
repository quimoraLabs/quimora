import express from "express";
import { createQuiz,getQuizById,getQuizzes,updateQuiz,changeQuizStatus,changeQuizActivity,deleteQuiz,getAllQuizzes } from "../controllers/quiz.controllers.js";
import authMiddleware, { adminMiddleware } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createQuiz);
router.get("/", authMiddleware, getQuizzes);
router.get("/all", authMiddleware, adminMiddleware, getAllQuizzes);
router.get("/:quizId", validateObjectId('quizId'), authMiddleware, getQuizById);
router.patch("/:quizId", validateObjectId('quizId'), authMiddleware, updateQuiz);
router.patch("/:quizId/status", validateObjectId('quizId'), authMiddleware, changeQuizStatus);
router.patch("/:quizId/activity", validateObjectId('quizId'), authMiddleware, changeQuizActivity);
router.delete("/:quizId", validateObjectId('quizId'), authMiddleware, deleteQuiz);

export default router;