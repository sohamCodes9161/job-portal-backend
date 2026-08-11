import Job from "../models/job.model.js"
import User from "../models/user.model.js"
import Application from "../models/application.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import fs from "fs";

export const getMe = (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      resume: user.resume,
      avatar: user.avatar,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      links: user.links,
      createdAt: user.createdAt,
    },
  });
};

export const updateUser = asyncHandler(async (req, res, next) => {

    const allowedFields = [
      "name",
      "email",
      "headline",
      "bio",
      "location",
      "skills",
      "links",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        resume: updatedUser.resume,
        avatar: updatedUser.avatar,
        headline: updatedUser.headline,
        bio: updatedUser.bio,
        location: updatedUser.location,
        skills: updatedUser.skills,
        links: updatedUser.links,
      },
    });
});

export const deleteUser = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ErrorHandler("User not found",404);
    }

// Delete jobs (if admin)
if (user.role === "admin") {
  await Job.deleteMany({ createdBy: user._id });
}

// Delete applications (for all users)
await Application.deleteMany({ user: user._id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

});

export const uploadResume = asyncHandler(async (req, res) => {
  console.log("REQ.FILE:", req.file); // 🔥 important
  console.log("REQ.BODY:", req.body);

  if (!req.file) {
    throw new ErrorHandler("No file uploaded", 400);
  }

  console.log("FILE PATH:", req.file.path); // 🔥 cloudinary URL should be here

  const user = await User.findById(req.user._id);

  console.log("USER FOUND:", user?._id);

  user.resume = {
  url: req.file.path,
  public_id: req.file.filename,
};
  await user.save();

  res.status(200).json({
    success: true,
    message: "Resume uploaded successfully",
    resume: user.resume,
  });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ErrorHandler("No file uploaded", 400);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  user.avatar = {
    url: req.file.path,
    public_id: req.file.filename,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated",
    avatar: user.avatar,
  });
});

// GET /api/users/:id
// Public-safe profile view — used by the small avatar/name links that
// appear on job cards, applicant rows, and message threads.
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name role avatar headline bio location skills links createdAt"
  );

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});