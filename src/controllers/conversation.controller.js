import Conversation from "../models/conversation.model.js";
import Job from "../models/job.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

// POST /api/conversations/job/:jobId
// Called from the small "Message recruiter" icon on the Job Details page.
// Atomically finds the existing (job, candidate) conversation or creates it —
// this is the fix for threads fragmenting: there is only ever one document
// per pair, enforced by the unique index on the model itself.
export const getOrCreateConversation = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    throw new ErrorHandler("Job not found", 404);
  }

  if (job.createdBy.equals(req.user._id)) {
    throw new ErrorHandler("You can't message yourself about your own job posting", 400);
  }

  const conversation = await Conversation.findOneAndUpdate(
    { job: job._id, candidate: req.user._id },
    {
      $setOnInsert: {
        job: job._id,
        candidate: req.user._id,
        recruiter: job.createdBy,
      },
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    conversation,
  });
});

// GET /api/conversations
// Inbox listing — candidates see their own conversations, recruiters see
// conversations tied to jobs they own.
export const getMyConversations = asyncHandler(async (req, res, next) => {
  const filter =
    req.user.role === "admin"
      ? { recruiter: req.user._id }
      : { candidate: req.user._id };

  const conversations = await Conversation.find(filter)
    .sort({ lastMessageAt: -1 })
    .populate("job", "title company")
    .populate("candidate", "name email avatar")
    .populate("recruiter", "name avatar");

  res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});

// GET /api/conversations/:id
// Full detail for a single thread's header (job info + the other participant).
export const getConversationById = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate("job", "title company location")
    .populate("candidate", "name email avatar")
    .populate("recruiter", "name avatar");

  if (!conversation) {
    throw new ErrorHandler("Conversation not found", 404);
  }

  const isCandidate = conversation.candidate._id.equals(req.user._id);
  const isRecruiter = conversation.recruiter._id.equals(req.user._id);

  if (!isCandidate && !isRecruiter) {
    throw new ErrorHandler("Access denied", 403);
  }

  res.status(200).json({
    success: true,
    conversation,
  });
});
