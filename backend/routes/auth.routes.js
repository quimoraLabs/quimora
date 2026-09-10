import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  createUserByAdmin,
  forgetPasswordRequest,
  verifyOTP,
} from "../controllers/auth.controllers.js";
import authMiddleware, {
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post("/register", registerUser);
router.post(
  "/admin/create-user",
  authMiddleware,
  authorizeRoles("admin"),
  createUserByAdmin,
);
router.post("/login", loginLimiter, loginUser);
router.get("/me", authMiddleware, getMe);
router.patch("/request-otp", otpLimiter, forgetPasswordRequest);
router.patch("/verify-otp", otpLimiter, verifyOTP);

export default router;
