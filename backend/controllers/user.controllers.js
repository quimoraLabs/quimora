import User from "../models/user.model.js";
import imagekit, { deleteMedia } from "../utils/imagekit.utils.js";
import { assertUserExists as checkUser } from "../utils/assertion.utils.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Empty collection" });
    }
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await checkUser(req.params.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    // Here we only check user exists or not
    const user = await checkUser(userId, "false");

    const allowedUpdates = {};
    const safeFields = ["username", "email", "name", "avatar"];

    safeFields.forEach((field) => {
      if (data[field] !== undefined) {
        allowedUpdates[field] = data[field];
      }
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
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

    if (user.avatar && user.avatar.fileId) {
      await deleteMedia(user.avatar.fileId);
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { active: false } },
      { new: true },
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { active: true } },
      { new: true },
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User activated successfully" });
  } catch (err) {
    next(err);
  }
};

export const upadteAvatar = async (req, res, next) => {
  try {
    // Here we need only avatar field
    const user = await checkUser(req.params.userId,"avatar");

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // 1. Delete the OLD avatar from ImageKit if it exists
    if (user.avatar && user.avatar.fileId) {
      await deleteMedia(user.avatar.fileId);
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: `avatar-${user._id}`,
      folder: "/quimora/profile",
    });

    user.avatar = {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    };


    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};
