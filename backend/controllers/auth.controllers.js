import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password,name } = req.body;
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
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: "1d" },
    );
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
