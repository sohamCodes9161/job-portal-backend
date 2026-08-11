import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import { createNotification } from "../utils/notify.js";

export const applyToJob = asyncHandler(async (req, res, next) => {
  const jobId = req.params.id;
  const userId = req.user._id;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ErrorHandler("Job not found", 404);
  }

  const existingApplication = await Application.findOne({
    user: userId,
    job: jobId,
  });

  if (existingApplication) {
    throw new ErrorHandler("Already applied to this job", 400);
  }

  const application = await Application.create({
    user: userId,
    job: jobId,
  });

  await createNotification({
    user: job.createdBy,
    type: "new_applicant",
    message: `New applicant for "${job.title}"`,
    link: `/admin/jobs/${job._id}/applicants`,
    relatedApplication: application._id,
  });

  res.status(201).json({
    success: true,
    message: "Applied successfully",
    application,
  });
});

export const getMyApplications = asyncHandler(async (req, res, next) => {

  const applications = await Application.find({ user: req.user._id })
    .populate({
      path: "job",
      populate: { path: "createdBy", select: "name avatar headline" },
    });

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });

});

export const getJobApplicants = asyncHandler(async (req, res, next) => {
  const jobId = req.params.id;

  const applications = await Application.find({ job: jobId })
    .populate("user", "name email resume avatar headline") // ✅ FIXED

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res, next) => {

  const { status } = req.body;

  if (!["accepted", "reviewed", "rejected"].includes(status)) {
    throw new ErrorHandler("Invalid status", 400);
  }

  const application = req.application;

  if (!application) {
    throw new ErrorHandler("Application not found", 404);
  }

  if (["accepted", "rejected"].includes(application.status)) {
    throw new ErrorHandler("Final status cannot be changed", 400);
  }

  application.status = status;
  await application.save();

  const job = await Job.findById(application.job).select("title");

  await createNotification({
    user: application.user,
    type: "application_status",
    message: job
      ? `Your application for "${job.title}" was ${status}`
      : `Your application status changed to ${status}`,
    link: `/applications`,
    relatedApplication: application._id,
  });

  res.status(200).json({
    success: true,
    message: "Application updated",
    application,
  });

});