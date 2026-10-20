import express from "express";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getAllLevels,
  getStudentLevels,
  getCurrentTierForElo,
} from "../controllers/level.controllers.js";

const router = express.Router();

// Public: All 6 Level tier thresholds
router.get("/", getAllLevels);

// Public: Calculate tier for arbitrary Elo score
router.get("/current-tier", getCurrentTierForElo);

// Student Protected: Student's calculated rank tier across interests
router.get("/student", authMiddleware, authorizeRoles("user"), getStudentLevels);

export default router;
