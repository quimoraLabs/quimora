import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  createUserByAdmin
} from "../controllers/auth.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/admin/create-user",authMiddleware,authorizeRoles("admin"),createUserByAdmin);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);

export default router;
