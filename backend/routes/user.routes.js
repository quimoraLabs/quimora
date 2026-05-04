import express from "express";
import { getUserById,getAllUsers,updateUser,deleteUser } from "../controllers/user.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";

const router = express.Router();

router.get("/all", authMiddleware,authorizeRoles("admin"), getAllUsers);
router.get("/:userId",validateObjectId('userId'), authMiddleware,getUserById );
router.patch("/:userId", validateObjectId('userId'), authMiddleware, updateUser);
router.delete("/:userId", validateObjectId('userId'), authMiddleware,authorizeRoles("admin"), deleteUser);

export default router;
