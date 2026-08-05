import { Router } from "express";
import { getInstructorDashboard } from "../controllers/instructorDashboard.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint for fetching dashboard analytics payload
router.get("/dashboard",authMiddleware,authorizeRoles("instructor"), getInstructorDashboard);

export default router;
