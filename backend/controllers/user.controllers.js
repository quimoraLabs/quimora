import User from "../models/user.model.js";
import imagekit, { deleteMedia } from "../utils/imagekit.utils.js";
import { assertUserExists as checkUser } from "../utils/assertion.utils.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    if (!users) {
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
    const data = req.body;
    const user = await checkUser(req.params.userId);

    if (data.role) {
      delete data.role;
    }

    Object.assign(user, data);
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User updated successfully", user });
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
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await checkUser(req.params.userId);
    user.active = false;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await checkUser(req.params.userId);
    user.active = true;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User activated successfully" });
  } catch (err) {
    next(err);
  }
};

export const upadteAvatar = async (req, res, next) => {
  try {
    const user = await checkUser(req.params.userId);

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
