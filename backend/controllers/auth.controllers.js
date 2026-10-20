import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/nodemailer.utils.js";
import UserService from "../services/user.service.js";

/**
 * @desc    Register a new student or instructor user
 * @route   POST /api/v2/auth/register
 * @access  Public
 * @returns {Object} User details and status message
 */
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, name, role } = req.body;
    const user = await UserService.createUser({ username, email, password, name, role });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new user with specific role (Admin privilege)
 * @route   POST /api/v2/auth/admin/create-user
 * @access  Private (Admin)
 * @returns {Object} Status message
 */
export const createUserByAdmin = async (req, res, next) => {
  try {
    const { username, email, password, name, role } = req.body;

    const allowedRoles = ["user", "instructor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      email,
      password,
      name,
      role,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created by admin",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/v2/auth/login
 * @access  Public
 * @returns {Object} JWT token
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.authenticateUser(email, password);

    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: "1d",
    });
    res.json({ success: true, token });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/v2/auth/me
 * @access  Private (Authenticated users)
 * @returns {Object} User profile object
 */
export const getMe = async (req, res, next) => {
  try {
    const { user, profile } = await UserService.getUserProfile(req.auth.userId);
    if (!user.active || user.suspendedAt) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact administrator.",
      });
    }
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.__v;
    res.json({
      ...userObj,
      profile: profile || null,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
};

/**
 * @desc    Request 6-digit email OTP for password reset
 * @route   PATCH /api/v2/auth/request-otp
 * @access  Public
 * @returns {Object} Status message
 */
export const forgetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+otp.code");

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent.",
      });
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();

    user.otp = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      purpose: "reset",
    };

    try {
      await sendOTPEmail(email, otpCode);
    } catch (emailError) {
      console.warn("Email delivery failed:", emailError.message);
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "If this email is registered, an OTP has been sent." });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and update user password
 * @route   PATCH /api/v2/auth/verify-otp
 * @access  Public
 * @returns {Object} Status message
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { otpCode, email, newPassword } = req.body;

    if (!/^\d{6}$/.test(otpCode || "")) {
      return res.status(400).json({ success: false, message: "OTP must be a 6-digit code" });
    }

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    const user = await User.findOne({ email }).select("+otp.code");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = user.otp?.code === otpCode;
    const isNotExpired = user.otp?.expiresAt > Date.now();
    const isPasswordResetOtp = user.otp?.purpose === "reset";

    if (!isMatch || !isNotExpired || !isPasswordResetOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      mustReauthenticate: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password for authenticated user (Direct password change)
 * @route   PATCH /api/v2/auth/change-password
 * @access  Private (Authenticated users)
 * @returns {Object} Status message
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.auth?.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
