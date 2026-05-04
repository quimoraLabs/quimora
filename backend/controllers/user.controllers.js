import User from "../models/user.model.js";
import crypto from "crypto";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
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

export const updateUser = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (data.role) {
      delete data.role;
    }

    Object.assign(user, data);
    await user.save();
    res.json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.active = false;
    await user.save();
    res.json({ success: true, message: "User deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.active = true;
    await user.save();
    res.json({ success: true, message: "User activated successfully" });
  } catch (err) {
    next(err);
  }
};

export const forgetPasswordRequest = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    const user = await User.findOne({ email }).select("+otp.code");
    const generateOTP = () => {
      return crypto.randomInt(100000, 1000000).toString();
    };

    const otp = {
      code:generateOTP(),
      expire:new Date.now(),
      type:"reset"
    }

    user.push(otp);
    await user.save();
    res.status(200).json({success:true,message:"Otp request send successfully"});
  } catch (error) {
    next(error);
  }
};
