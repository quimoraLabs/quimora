import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  createUserByAdmin,
  forgetPasswordRequest,
  verifyOTP} from "../controllers/auth.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/admin/create-user",authMiddleware,authorizeRoles("admin"),createUserByAdmin);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.patch("/request-otp",authMiddleware,forgetPasswordRequest);
router.patch("/verify-otp",authMiddleware,verifyOTP);


export default router;
