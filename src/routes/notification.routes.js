import express from "express";

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";

import { authMiddleware, validateObjectId } from "../middleware/auth.middleware.js";

const router = express.Router();

// Mounted at /api/notifications
router.get("/", authMiddleware, getMyNotifications);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.patch("/:id/read", authMiddleware, validateObjectId("id"), markNotificationRead);

export default router;
