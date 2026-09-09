import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import imagekit, { deleteMedia } from "../utils/imagekit.utils.js";
import { assertUserExists as checkUser } from "../utils/assertion.utils.js";

/**
 * @desc    Get all users with consistent response format
 * @route   GET /api/v1/users
 * @access  Private (Admin only)
 * @returns { success, count, users }
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
     res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user by ID with consistent response format
 * @route   GET /api/v1/users/:userId
 * @access  Private (Admin only)
 * @returns { success, user }
 */

export const getUserById = async (req, res, next) => {
  try {
    const user = await checkUser(req.params.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user details (username, email, name, avatar)
 * @route   PATCH /api/v1/users/:userId
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @body    { username, email, name, avatar }
 */
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.auth?.userId?.toString();
    const currentUserRole = req.auth?.role;

    if (currentUserRole !== "admin" && currentUserId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to update this user profile" });
    }

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
      { returnDocument: 'after', runValidators: true },
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

/**
 * @desc    Delete a user (with self-protection + last-admin protection)
 * @route   DELETE /api/v1/users/:userId
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @throws  400 - Cannot delete own account / Cannot delete last admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.auth?.userId?.toString();

    // SELF-PROTECTION: Admin cannot delete own account
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // LAST-ADMIN PROTECTION: Cannot delete the only admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the only admin in the system"
        });
      }
    }

    // Cascade deletion: attempts by user
    await QuizAttempt.deleteMany({ userId });

    // Cascade deletion: quizzes created by instructor user
    const instructorQuizzes = await Quiz.find({ createdBy: userId }).select("_id");
    if (instructorQuizzes.length > 0) {
      const quizIds = instructorQuizzes.map((q) => q._id);
      await Question.deleteMany({ quizId: { $in: quizIds } });
      await QuizAttempt.deleteMany({ quizId: { $in: quizIds } });
      await Quiz.deleteMany({ createdBy: userId });
    }

    await User.findByIdAndDelete(userId);

    if (user.avatar && user.avatar.fileId) {
      await deleteMedia(user.avatar.fileId);
    }

    res.status(200).json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle user active/deactivated status
 * @route   PATCH /api/v1/users/:userId/active
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @throws  400 - Cannot deactivate own account / Cannot deactivate last admin
 */
export const toggleUserActiveStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.auth?.userId?.toString();

    // SELF-PROTECTION: Admin cannot deactivate own account
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // LAST-ADMIN PROTECTION: Cannot deactivate the only admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate the only admin in the system"
        });
      }
    }

    user.active = !user.active;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.active ? "activated" : "deactivated"} successfully`,
      active: user.active,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user avatar using ImageKit
 * @route   PATCH /api/v1/users/:userId/avatar
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @body    { file } - Multipart form-data with image file
 */
export const upadteAvatar = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.auth?.userId?.toString();
    const currentUserRole = req.auth?.role;

    if (currentUserRole !== "admin" && currentUserId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to update this avatar" });
    }

    // Here we need only avatar field
    const user = await checkUser(userId, "avatar");

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
