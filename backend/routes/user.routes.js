import express from "express";
import { getUserById,getAllUsers,updateUser,deleteUser } from "../controllers/user.controllers.js";
import authMiddleware, { adminMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/all", authMiddleware,adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware,getUserById );
router.patch("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware,adminMiddleware, deleteUser);

export default router;
