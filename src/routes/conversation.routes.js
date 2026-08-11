import express from "express";

import {
  getOrCreateConversation,
  getMyConversations,
  getConversationById,
} from "../controllers/conversation.controller.js";

import { getMessages, sendMessage } from "../controllers/message.controller.js";

import {
  authMiddleware,
  validateObjectId,
  checkConversationParticipant,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Mounted at /api/conversations
//
//   POST /api/conversations/job/:jobId    -> start/find the thread for a job (candidate only)
//   GET  /api/conversations                -> inbox listing (role-aware)
//   GET  /api/conversations/:id            -> single thread header info
//   GET  /api/conversations/:id/messages   -> message history
//   POST /api/conversations/:id/messages   -> send a message

router.post(
  "/job/:jobId",
  authMiddleware,
  validateObjectId("jobId"),
  getOrCreateConversation
);

router.get("/", authMiddleware, getMyConversations);

router.get(
  "/:id",
  authMiddleware,
  validateObjectId("id"),
  checkConversationParticipant,
  getConversationById
);

router.get(
  "/:id/messages",
  authMiddleware,
  validateObjectId("id"),
  checkConversationParticipant,
  getMessages
);

router.post(
  "/:id/messages",
  authMiddleware,
  validateObjectId("id"),
  checkConversationParticipant,
  sendMessage
);

export default router;
