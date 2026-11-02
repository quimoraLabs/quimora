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

// Student Routes (role is "user" for all students)
router.get("/overview", authMiddleware, authorizeRoles("user"), getStudentRewardsOverview);
router.post("/direct-pass", authMiddleware, authorizeRoles("user"), buyDirectPassHandler);
router.post("/extra-pass-attempt", authMiddleware, authorizeRoles("user"), buyExtraPassAttemptHandler);
router.post("/appeals/:quizId", authMiddleware, authorizeRoles("user"), submitAppealHandler);
router.get("/appeals/:quizId/status", authMiddleware, authorizeRoles("user"), getAppealStatusHandler);

// Admin Routes
router.get("/admin/appeals", authMiddleware, authorizeRoles("admin"), getAdminAppealsHandler);
router.patch("/admin/appeals/:appealId/review", authMiddleware, authorizeRoles("admin"), reviewAdminAppealHandler);

export default router;
