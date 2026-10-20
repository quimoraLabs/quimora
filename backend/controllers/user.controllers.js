import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import imagekit, { deleteMedia, uploadMedia } from "../utils/imagekit.utils.js";
import { assertUserExists as checkUser } from "../utils/assertion.utils.js";
import UserService from "../services/user.service.js";

/**
 * @desc    Get all users with consistent response format
 * @route   GET /api/v2/users
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
 * @route   GET /api/v2/users/:userId
 * @access  Private (Admin only)
 * @returns { success, user }
 */

export const getUserById = async (req, res, next) => {
  try {
    const { user, profile } = await UserService.getUserProfile(req.params.userId);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    res.status(200).json({
      ...userObj,
      profile: profile || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user details (username, email, name, avatar)
 * @route   PATCH /api/v2/users/:userId
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

    const updatedUser = await UserService.updateUser(userId, req.body);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Delete a user (with self-protection + last-admin protection)
 * @route   DELETE /api/v2/users/:userId
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @throws  400 - Cannot delete own account / Cannot delete last admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.auth?.userId?.toString();

    const user = await UserService.deleteUser(userId, currentUserId);

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
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Toggle user active/deactivated status
 * @route   PATCH /api/v2/users/:userId/active
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
    if (!user.active) {
      user.suspendedAt = new Date();
      user.suspendedReason = "Account deactivated by administrator";
    } else {
      user.suspendedAt = null;
      user.suspendedReason = null;
    }
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
 * @route   PATCH /api/v2/users/:userId/avatar
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @body    { file } - Multipart form-data with image file
 */
export const updateAvatar = async (req, res, next) => {
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

    const uploadResponse = await uploadMedia({
      fileBuffer: req.file.buffer,
      fileName: `avatar-${user._id}`,
      folder: "/quimora/profile",
      mimetype: req.file.mimetype,
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

/**
 * @desc    Change user role (Role Elevation / Demotion)
 * @route   PATCH /api/v2/users/:userId/role
 * @access  Private (Admin only)
 * @param   {string} userId - User ID from URL params
 * @body    { role } - Target role ('user' | 'instructor' | 'admin')
 * @throws  400 - Invalid role / Cannot demote own account / Cannot demote last admin
 */
export const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.auth?.userId?.toString();

    const user = await UserService.changeUserRole(userId, role, currentUserId);

    res.status(200).json({
      success: true,
      message: `User role changed to ${user.role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
