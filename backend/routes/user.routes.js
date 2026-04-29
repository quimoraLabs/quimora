import express from "express";
import { getUserById,getAllUsers,updateUser,deleteUser } from "../controllers/user.controllers.js";
import authMiddleware, { adminMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get/:id", authMiddleware,getUserById );
router.get("/all", authMiddleware, getAllUsers);
router.patch("/update/:id", authMiddleware, updateUser);
router.delete("/delete/:id", authMiddleware,adminMiddleware, deleteUser);

export default router;
