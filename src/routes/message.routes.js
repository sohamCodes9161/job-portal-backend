import express from "express";

import { getMessages, sendMessage } from "../controllers/message.controller.js";

import {
  authMiddleware,
  validateObjectId,
  checkApplicationParticipant,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Mounted at /api/applications, so these become:
//   GET  /api/applications/:id/messages
//   POST /api/applications/:id/messages
// where :id is the Application ID.

router.get(
  "/:id/messages",
  authMiddleware,
  validateObjectId("id"),
  checkApplicationParticipant,
  getMessages
);

router.post(
  "/:id/messages",
  authMiddleware,
  validateObjectId("id"),
  checkApplicationParticipant,
  sendMessage
);

export default router;
