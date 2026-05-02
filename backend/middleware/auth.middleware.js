import jwt from "jsonwebtoken";
import config from "../config/config.js";


const authMiddleware = (req, res, next) => {
  if (typeof next !== "function") {
    return res.status(500).json({ success: false, message: "Middleware configuration error" });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded; // { id: userId }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (typeof next !== "function") {
    return res.status(500).json({ success: false, message: "Middleware configuration error" });
  }

  // authMiddleware MUST run before this, or req.user will be empty
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
  next();
};

export default authMiddleware;
