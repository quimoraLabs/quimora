import express from "express";
import { practiceController } from "../controllers/practice.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// All practice endpoints require authenticated student role
router.use(authMiddleware, authorizeRoles("user"));

// Status, Scoreboard & Daily Target
router.get("/status", practiceController.getStatus);
router.post("/custom-target", practiceController.setCustomDailyTarget);

// Demo Tutorial Mock Quiz (Quick 2-3 questions for first-time exam onboarding)
router.post("/demo/start", practiceController.startDemoTutorial);

// Mode 1: Random Mind-Game
router.post("/mode1/start", practiceController.startRandomMindGame);

// Mode 2: Custom Daily Drill
router.post("/mode2/start", practiceController.startCustomDrill);

// Submission & Evaluation
router.post("/submit", practiceController.submitSession);

export default router;

