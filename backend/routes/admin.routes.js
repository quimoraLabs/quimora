// backend/routes/admin.routes.js
import express from "express";
import { getAdminStats } from "../controllers/admin.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, authorizeRoles("admin"), getAdminStats);

export default router;