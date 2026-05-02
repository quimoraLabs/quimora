import express from "express";
import { createQuiz,getQuizById,getQuizzes,updateQuiz,changeQuizStatus,changeQuizActivity } from "../controllers/quiz.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createQuiz);
router.get("/all", authMiddleware, getQuizzes);
router.get("/:id", authMiddleware, getQuizById);
router.patch("/:id", authMiddleware, updateQuiz);
router.patch("/:id/status", authMiddleware, changeQuizStatus);
router.patch("/:id/activity", authMiddleware, changeQuizActivity);

export default router;