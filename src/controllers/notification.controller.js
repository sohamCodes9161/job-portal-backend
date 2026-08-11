import Notification from "../models/notification.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

// GET /api/notifications
export const getMyNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    readAt: null,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    notifications,
  });
});

// PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    throw new ErrorHandler("Notification not found", 404);
  }

  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, readAt: null },
    { readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});
