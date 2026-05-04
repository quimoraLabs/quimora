import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded?.id || typeof decoded.id !== "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id).select("role permissions");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.auth = {
      userId: user._id,
      role: user.role,
      permissions: user.permissions,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Malformed token" });
    }
    next(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: "No authentication data found" });
    }
    const role = req.auth?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Role not allowed" });
    }

    next();
  };
};

export default authMiddleware;
