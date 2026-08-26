import { Router } from "express";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireDb,
  asyncHandler(async (_req, res) => {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json({ jobs });
  }),
);

router.get(
  "/:id",
  requireAuth,
  requireDb,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Job not found." });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    res.json({ job });
  }),
);

export default router;
