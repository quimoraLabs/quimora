import express from "express";
import { getUserById,getAllUsers,updateUser,deleteUser,upadteAvatar } from "../controllers/user.controllers.js";
import authMiddleware, { authorizeRoles } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validObjectId.middleware.js";
import { singleUpload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/all", authMiddleware,authorizeRoles("admin"), getAllUsers);
router.get("/:userId",validateObjectId('userId'), authMiddleware,getUserById );
router.patch("/:userId", validateObjectId('userId'), authMiddleware, updateUser);
router.delete("/:userId", validateObjectId('userId'), authMiddleware,authorizeRoles("admin"), deleteUser);
router.patch("/:userId/avatar",authMiddleware, singleUpload,upadteAvatar);

export default router;
