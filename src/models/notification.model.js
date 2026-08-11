import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Who should see this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["application_status", "new_message", "new_applicant"],
      required: true,
    },

    // Human-readable text shown in the notification bell
    message: {
      type: String,
      required: true,
    },

    // Frontend route to send the user to when they click the notification
    link: {
      type: String,
    },

    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },

    relatedConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

// Guarantees at most ONE notification per (user, conversation) for
// message-type notifications — new messages update the existing one
// instead of piling up a fresh notification per message.
notificationSchema.index(
  { user: 1, relatedConversation: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { relatedConversation: { $exists: true } },
  }
);

export default mongoose.model("Notification", notificationSchema);
