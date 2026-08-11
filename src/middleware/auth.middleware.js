import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Conversation from "../models/conversation.model.js";

import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "./asyncHandler.js";

/**
 * 🔐 AUTH MIDDLEWARE
 * Verifies JWT and attaches user to req
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "NO_TOKEN"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "USER_NOT_FOUND"
      });
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "TOKEN_EXPIRED"
      });
    }

    return res.status(401).json({
      success: false,
      message: "INVALID_TOKEN"
    });
  }
});
/**
 * 🔒 ROLE AUTHORIZATION
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler("Access denied", 403));
    }
    next();
  };
};

/**
 * 🆔 VALIDATE OBJECT ID
 */
export const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid ID format", 400));
  }

  next();
};

/**
 * 🏢 CHECK JOB OWNERSHIP
 */
export const checkJobOwnership = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ErrorHandler("Job not found", 404);
  }

  // Attach job to request
  req.job = job;

  if (!job.createdBy.equals(req.user._id)) {
    throw new ErrorHandler("Not authorized", 403);
  }

  next();
});

/**
 * 📄 CHECK APPLICATION OWNERSHIP
 */
export const checkApplicationOwnership = asyncHandler(
  async (req, res, next) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
      throw new ErrorHandler("Application not found", 404);
    }

    const job = await Job.findById(application.job);

    if (!job) {
      throw new ErrorHandler("Job not found", 404);
    }

    if (!job.createdBy.equals(req.user._id)) {
      throw new ErrorHandler("Access denied", 403);
    }

    // Attach application
    req.application = application;

    next();
  }
);

/**
 * 💬 CHECK CONVERSATION PARTICIPANT
 * Messaging is now scoped to a Conversation (one per job+candidate pair),
 * not an Application. Both the candidate and the recruiter who owns the
 * job need access to read/send in that thread.
 */
export const checkConversationParticipant = asyncHandler(
  async (req, res, next) => {
    const conversation = await Conversation.findById(req.params.id).populate(
      "job",
      "title createdBy"
    );

    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    const isCandidate = conversation.candidate.equals(req.user._id);
    const isRecruiter = conversation.recruiter.equals(req.user._id);

    if (!isCandidate && !isRecruiter) {
      throw new ErrorHandler("Access denied", 403);
    }

    req.conversation = conversation;
    next();
  }
);