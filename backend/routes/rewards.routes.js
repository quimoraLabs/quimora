import express from "express";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getStudentRewardsOverview,
  buyDirectPassHandler,
  buyExtraPassAttemptHandler,
  submitAppealHandler,
  getAppealStatusHandler,
  getAdminAppealsHandler,
  reviewAdminAppealHandler,
} from "../controllers/rewards.controllers.js";

const router = express.Router();

// Student Routes
router.get("/overview", authMiddleware, authorizeRoles("student"), getStudentRewardsOverview);
router.post("/direct-pass", authMiddleware, authorizeRoles("student"), buyDirectPassHandler);
router.post("/extra-pass-attempt", authMiddleware, authorizeRoles("student"), buyExtraPassAttemptHandler);
router.post("/appeals/:quizId", authMiddleware, authorizeRoles("student"), submitAppealHandler);
router.get("/appeals/:quizId/status", authMiddleware, authorizeRoles("student"), getAppealStatusHandler);

// Admin Routes
router.get("/admin/appeals", authMiddleware, authorizeRoles("admin"), getAdminAppealsHandler);
router.patch("/admin/appeals/:appealId/review", authMiddleware, authorizeRoles("admin"), reviewAdminAppealHandler);

export default router;
