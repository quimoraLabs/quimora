import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/nodemailer.utils.js";

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;
    const existingUser = await User.findOne({ email: email || username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = new User({ username, email, password, name });
    await user.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    next(err);
  }
};

export const createUserByAdmin = async (req, res, next) => {
  try {
    const { username, email, password, name, role } = req.body;

    // 🔥 only allow safe roles
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
      role, // admin controlled
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

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: "1d",
    });
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.userId).select("-password -__v");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const forgetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+otp.code");

    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid email" });
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();

    user.otp = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      type: "reset",
    };

    await sendOTPEmail(email, otpCode);

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Otp request send successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otpCode, email, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+otp.code");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const isMatch = user.otp.code === otpCode;
    const isNotExpired = user.otp.expiresAt > Date.now();
    console.log(user.otp.expiresAt)

    if (!isMatch || !isNotExpired) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    next(error);
  }
};
