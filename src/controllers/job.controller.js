import ApiFeatures from "../utils/apiFeatures.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { application } from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";


export const createJob = asyncHandler(async (req, res, next) => {

  const { title, description, company, location, salary, jobType } = req.body;

  // 1. Validate input
  if (!title || !description || !company || !location || !salary) {
    throw new ErrorHandler("All required fields must be provided", 400);
  }

  // 2. Create job
  const job = await Job.create({
    title,
    description,
    company,
    location,
    salary,
    jobType,
    createdBy: req.user._id, // 🔥 IMPORTANT
  });

  // 3. Send response
  res.status(201).json({
    success: true,
    message: "Job created successfully",
    job,
  });
});


export const getAllJobs = asyncHandler(async (req, res, next) => {
  const resultPerPage = 5;

  // 🔥 Step 1: Apply search + filter ONLY (no pagination yet)
  const apiFeatures = new ApiFeatures(Job.find(), req.query)
    .search()
    .filter();

  // 🔥 Step 2: Count total jobs BEFORE pagination
  const totalJobs = await apiFeatures.query.clone().countDocuments();

  // 🔥 Step 3: Apply sort + pagination
  apiFeatures.sort().pagination(resultPerPage);

  // 🔥 Step 4: Fetch jobs
  const jobs = await apiFeatures.query.populate(
    "createdBy",
    "name avatar headline email"
  );

  // 🔥 Step 5: Calculate total pages
  const totalPages = Math.ceil(totalJobs / resultPerPage);

  res.status(200).json({
    success: true,
    jobs,
    totalJobs,
    totalPages,
    currentPage: Number(req.query.page) || 1,
  });
});
export const getJobById = asyncHandler(async (req, res, next) => {

  const job = await Job.findById(req.params.id).populate(
    "createdBy",
    "name avatar headline email"
  );

  if (!job) {
    throw new ErrorHandler("Job not found", 404);
  }

  res.status(200).json({
    success: true,
    job,
  });
});

export const updateJob = asyncHandler(async (req, res, next) => {

  // Update
  const updatedJob = await Job.findByIdAndUpdate(
    req.job.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    job: updatedJob,
  });

});
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id });

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
});
export const deleteJob = asyncHandler(async (req, res, next) => {

  const job = req.job; // from middleware

  // 🔥 Delete related applications
  await Application.deleteMany({ job: job._id });

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});


export const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user._id;

    // 1️⃣ Get jobs created by admin
    const jobs = await Job.find({ createdBy: adminId });

    const jobIds = jobs.map((job) => job._id);

    // 2️⃣ Count total applicants
    const totalApplicants = await Application.countDocuments({
      job: { $in: jobIds },
    });

    // 3️⃣ Recent jobs (latest 5)
    const recentJobs = await Job.find({ createdBy: adminId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        totalApplicants,
        recentJobs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};