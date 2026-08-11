import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import { upsertNotification } from "../utils/notify.js";

// GET /api/conversations/:id/messages
export const getMessages = asyncHandler(async (req, res, next) => {
  const conversation = req.conversation;

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .populate("sender", "name role avatar");

  // Mark any messages from the *other* participant as read now that this
  // participant has fetched the thread.
  await Message.updateMany(
    {
      conversation: conversation._id,
      sender: { $ne: req.user._id },
      readAt: null,
    },
    { readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

// POST /api/conversations/:id/messages
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { body } = req.body;

  if (!body || !body.trim()) {
    throw new ErrorHandler("Message body is required", 400);
  }

  const conversation = req.conversation;
  const trimmedBody = body.trim();

  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body: trimmedBody,
  });

  await newMessage.populate("sender", "name role avatar");

  // Keep the inbox preview/sort order fresh
  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessageAt: new Date(),
    lastMessagePreview: trimmedBody.slice(0, 80),
  });

  // Notify whichever side didn't just send the message
  const isCandidate = conversation.candidate.equals(req.user._id);
  const recipientId = isCandidate ? conversation.job.createdBy : conversation.candidate;
  const recipientIsRecruiter = isCandidate;

  await upsertNotification({
    user: recipientId,
    type: "new_message",
    message: `${req.user.name} sent a new message on "${conversation.job.title}"`,
    link: recipientIsRecruiter
      ? `/admin/messages/${conversation._id}`
      : `/messages/${conversation._id}`,
    relatedConversation: conversation._id,
  });

  res.status(201).json({
    success: true,
    message: "Message sent",
    data: newMessage,
  });
});
