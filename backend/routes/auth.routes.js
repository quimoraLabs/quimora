import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  createUserByAdmin,
  forgetPasswordRequest,
  verifyOTP,
  changePassword,
} from "../controllers/auth.controllers.js";
import authMiddleware, {
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

// Dedicated limiter for sending OTP (strict to prevent email flooding)
const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP send requests per window
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dedicated limiter for OTP verification attempts (permits retries without consuming send quota)
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 OTP verification requests per window
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again after 15 minutes.",
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
router.patch("/request-otp", requestOtpLimiter, forgetPasswordRequest);
router.patch("/verify-otp", verifyOtpLimiter, verifyOTP);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
