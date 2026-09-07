import { Router } from "express";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { scoreJob } from "../ingestion/matcher.js";

const router = Router();

// GET /api/jobs?page=1&limit=50
router.get(
  "/",
  requireAuth,
  requireDb,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    // Fetch user preferences for match scoring
    const user = await User.findById(req.userId).lean();
    const preferences = user?.preferences ?? null;

    const [jobs, total] = await Promise.all([
      Job.find().sort({ postedAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(),
    ]);

    // Score each job and sort by match score descending, then by postedAt
    const scored = jobs
      .map((job) => {
        const { score, reasons } = scoreJob(job, preferences);
        return { ...job, id: job._id.toString(), matchScore: score, matchReasons: reasons };
      })
      .sort((a, b) => b.matchScore - a.matchScore || new Date(b.postedAt) - new Date(a.postedAt));

    res.json({
      jobs: scored,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),
);

// GET /api/jobs/:id
router.get(
  "/:id",
  requireAuth,
  requireDb,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Job not found." });
    }

    const [job, user] = await Promise.all([
      Job.findById(req.params.id).lean(),
      User.findById(req.userId).lean(),
    ]);

    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    const { score, reasons } = scoreJob(job, user?.preferences ?? null);
    res.json({ job: { ...job, id: job._id.toString(), matchScore: score, matchReasons: reasons } });
  }),
);

export default router;
