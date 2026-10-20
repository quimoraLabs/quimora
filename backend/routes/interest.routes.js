import express from "express";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getInterests,
  getStudentProfile,
  completeStudentOnboarding,
  updateStudentInterests,
} from "../controllers/interest.controllers.js";

const router = express.Router();

// Public: Browse all active interest topics
router.get("/", getInterests);

// Student Protected: Profile, Onboarding & Interest Selection
router.get(
  "/student/profile",
  authMiddleware,
  authorizeRoles("user"),
  getStudentProfile
);

router.post(
  "/student/onboarding",
  authMiddleware,
  authorizeRoles("user"),
  completeStudentOnboarding
);

router.put(
  "/student/interests",
  authMiddleware,
  authorizeRoles("user"),
  updateStudentInterests
);

export default router;
