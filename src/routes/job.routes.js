import express from "express";

// Controllers
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  getDashboardStats, // ✅ ADD THIS
} from "../controllers/job.controller.js";

import {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
} from "../controllers/application.controller.js";

// Middleware
import {
  authMiddleware,
  validateObjectId,
  checkJobOwnership,
  checkApplicationOwnership,
} from "../middleware/auth.middleware.js";

import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ================= JOB ROUTES =================

// 🌍 Public
router.get("/", getAllJobs);

// 🧑‍💼 Admin - MY JOBS (ADD THIS HERE)
router.get(
  "/my-jobs",
  authMiddleware,
  authorizeRoles("admin"),
  getMyJobs
);

// 🔹 Dashboard stats (admin only)

router.get(
  "/dashboard-stats",
  authMiddleware,
  authorizeRoles("admin"),
  getDashboardStats
);

// Create job (admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), createJob);

// Update job (admin + owner)
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  checkJobOwnership,
  updateJob
);

// Delete job (admin + owner)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  checkJobOwnership,
  deleteJob
);

// ================= APPLICATION ROUTES =================

// Apply to job
router.post("/:id/apply", authMiddleware, applyToJob);

// Get my applications
router.get("/getmyapplications", authMiddleware, getMyApplications);

// Get applicants (admin + owner)
router.get(
  "/:id/applicants",
  authMiddleware,
  authorizeRoles("admin"),
  checkJobOwnership,
  getJobApplicants
);

// Update application status
router.put(
  "/:id/update",
  authMiddleware,
  authorizeRoles("admin"),
  checkApplicationOwnership,
  updateApplicationStatus
);

// ❗ KEEP THIS LAST
router.get("/:id", validateObjectId("id"), getJobById);

export default router;