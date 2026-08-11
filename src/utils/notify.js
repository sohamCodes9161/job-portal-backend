import Notification from "../models/notification.model.js";

/**
 * Creates a notification for a user. Swallows errors on purpose —
 * a failed notification should never break the request that triggered it
 * (e.g. sending a message should still succeed even if this fails).
 */
export const createNotification = async ({
  user,
  type,
  message,
  link,
  relatedApplication,
  relatedConversation,
}) => {
  try {
    await Notification.create({
      user,
      type,
      message,
      link,
      relatedApplication,
      relatedConversation,
    });
  } catch (err) {
    console.error("⚠️ Failed to create notification:", err.message);
  }
};

/**
 * Like createNotification, but collapses into a single document per
 * (user, relatedConversation, type) instead of creating a new row every
 * time. Used for new-message notifications: 5 new chat messages should
 * surface as ONE "new messages" notification, not 5 separate ones. The
 * unique partial index on the model is what makes this race-safe.
 */
export const upsertNotification = async ({
  user,
  type,
  message,
  link,
  relatedConversation,
}) => {
  try {
    await Notification.findOneAndUpdate(
      { user, type, relatedConversation },
      { $set: { message, link, readAt: null } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error("⚠️ Failed to upsert notification:", err.message);
  }
};
