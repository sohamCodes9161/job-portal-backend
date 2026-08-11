import express from "express";
import {
  getMe,
  updateUser,
  deleteUser,
  uploadResume,
  uploadAvatar,
  getPublicProfile,
} from "../controllers/user.controller.js";
import { authMiddleware, validateObjectId } from "../middleware/auth.middleware.js";
import { loginUser, registerUser, refreshtoken, logoutUser } from "../controllers/auth.controller.js";

import upload, { uploadAvatar as uploadAvatarMiddleware } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/refresh", refreshtoken);
router.post("/logout", authMiddleware, logoutUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

router.post("/register", registerUser);
router.get("/me", authMiddleware, getMe);

router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.post(
  "/upload-avatar",
  authMiddleware,
  uploadAvatarMiddleware.single("avatar"),
  uploadAvatar
);

// Public-safe profile view — MUST stay below "/me" so that route still wins.
router.get("/:id", authMiddleware, validateObjectId("id"), getPublicProfile);

export default router;
