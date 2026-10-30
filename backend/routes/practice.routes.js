import express from "express";
import { practiceController } from "../controllers/practice.controllers.js";
import authMiddleware, { authorizeRoles, checkStudentOnboarding } from "../middleware/auth.middleware.js";

const router = express.Router();

// All practice endpoints require authenticated student role
router.use(authMiddleware, authorizeRoles("user"), checkStudentOnboarding);

// Status, Scoreboard & Daily Target
router.get("/status", practiceController.getStatus);
router.post("/custom-target", practiceController.setCustomDailyTarget);

// Mode 1: Random Mind-Game
router.post("/mode1/start", practiceController.startRandomMindGame);

// Mode 2: Custom Daily Drill
router.post("/mode2/start", practiceController.startCustomDrill);

// Submission & Evaluation
router.post("/submit", practiceController.submitSession);

export default router;

