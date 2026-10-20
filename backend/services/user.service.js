import User from "../models/user.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import InstructorProfile from "../models/instructorProfile.model.js";
import Interest from "../models/interest.model.js";

export class UserService {
  /**
   * Register a new user (Forbidden to pass role: 'admin')
   */
  static async createUser(userData) {
    const { name, email, username, password, role } = userData;

    if (role === "admin") {
      const error = new Error("Admin accounts cannot be created via public registration");
      error.statusCode = 403;
      throw error;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error("Email address is already registered");
      error.statusCode = 400;
      throw error;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      const error = new Error("Username is already taken");
      error.statusCode = 400;
      throw error;
    }

    const user = new User({
      name,
      email,
      username,
      password,
      role: role || "user",
      active: true,
    });

    await user.save();

    // Auto-create role profile
    if (user.role === "user") {
      await StudentProfile.create({ userId: user._id });
    } else if (user.role === "instructor") {
      await InstructorProfile.create({ userId: user._id });
    }

    return user;
  }

  /**
   * Authenticate user with Email/Username & Password
   */
  static async authenticateUser(identifier, password) {
    const user = await User.findOne({
      $or: [{ email: identifier?.toLowerCase() }, { username: identifier }],
    }).select("+password");

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 400;
      throw error;
    }

    if (!user.active || user.suspendedAt) {
      const error = new Error(
        `Your account is deactivated. Please contact administrator.`
      );
      error.statusCode = 403;
      error.code = "ACCOUNT_SUSPENDED";
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 400;
      throw error;
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    return user;
  }

  /**
   * Update user details (username, email, name, avatar)
   */
  static async updateUser(userId, updateData) {
    const allowedUpdates = {};
    const safeFields = ["username", "email", "name", "avatar"];

    safeFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        allowedUpdates[field] = updateData[field];
      }
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: allowedUpdates },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return updatedUser;
  }

  /**
   * Delete a user with self-protection and last-admin protection
   */
  static async deleteUser(targetUserId, currentUserId) {
    if (targetUserId === currentUserId) {
      const error = new Error("You cannot delete your own account");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        const error = new Error("Cannot delete the only admin in the system");
        error.statusCode = 400;
        throw error;
      }
    }

    return user;
  }

  /**
   * Change user role (Role Elevation / Demotion) with protections
   */
  static async changeUserRole(targetUserId, role, currentUserId) {
    if (!role || !["user", "instructor", "admin"].includes(role.toLowerCase())) {
      const error = new Error("Invalid role specified. Allowed roles: 'user', 'instructor', 'admin'");
      error.statusCode = 400;
      throw error;
    }

    const targetRole = role.toLowerCase();

    if (targetUserId === currentUserId && targetRole !== "admin") {
      const error = new Error("You cannot demote your own admin account");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.role === "admin" && targetRole !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        const error = new Error("Cannot demote the last admin in the system");
        error.statusCode = 400;
        throw error;
      }
    }

    user.role = targetRole;
    await user.save();

    return user;
  }

  /**
   * Suspend a user account (Admin only)
   */
  static async suspendUser(targetUserId, reason) {
    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.role === "admin") {
      const error = new Error("Admin accounts cannot be suspended");
      error.statusCode = 403;
      throw error;
    }

    user.active = false;
    user.suspendedAt = new Date();
    user.suspendedReason = reason || "Suspended by administrator";
    await user.save();

    return user;
  }

  /**
   * Reactivate a suspended user account (Admin only)
   */
  static async reactivateUser(targetUserId) {
    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    user.active = true;
    user.suspendedAt = null;
    user.suspendedReason = null;
    await user.save();

    return user;
  }

  /**
   * Update username enforcing 30-day restriction rule
   */
  static async updateUsername(userId, newUsername) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.username === newUsername) {
      return user;
    }

    const now = new Date();
    if (user.lastUsernameChangedAt) {
      const diffMs = now - new Date(user.lastUsernameChangedAt);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 30) {
        const nextAllowed = new Date(
          user.lastUsernameChangedAt.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        const error = new Error(
          `Username can only be changed once every 30 days. You can change it again on ${nextAllowed.toLocaleDateString()}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const existing = await User.findOne({ username: newUsername });
    if (existing && existing._id.toString() !== userId.toString()) {
      const error = new Error("Username is already taken");
      error.statusCode = 400;
      throw error;
    }

    user.username = newUsername;
    user.lastUsernameChangedAt = now;
    await user.save();

    return user;
  }

  /**
   * Get user profile with role-specific profile joined
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    let roleProfile = null;
    if (user.role === "user") {
      roleProfile = await StudentProfile.findOne({ userId }).populate("interests");
      if (!roleProfile) {
        roleProfile = await StudentProfile.create({ userId });
      }
    } else if (user.role === "instructor") {
      roleProfile = await InstructorProfile.findOne({ userId });
      if (!roleProfile) {
        roleProfile = await InstructorProfile.create({ userId });
      }
    }

    return {
      user,
      profile: roleProfile,
    };
  }
}

export default UserService;
