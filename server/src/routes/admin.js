import { Router } from "express";
import Job from "../models/Job.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runIngestion } from "../ingestion/orchestrator.js";
import { ADAPTERS } from "../scheduler.js";

const router = Router();

// All admin routes require both auth + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get(
  "/stats",
  requireDb,
  asyncHandler(async (_req, res) => {
    const pipeline = [
      {
        $group: {
          _id: { source: "$source", sourceCompany: "$sourceCompany" },
          count: { $sum: 1 },
          lastIngested: { $max: "$updatedAt" },
        },
      },
      { $sort: { count: -1 } },
    ];

    const [groups, totalJobs] = await Promise.all([
      Job.aggregate(pipeline),
      Job.countDocuments(),
    ]);

    const bySource = groups.map((g) => ({
      source: g._id.source,
      company: g._id.sourceCompany,
      count: g.count,
      lastIngested: g.lastIngested,
    }));

    const lastIngested =
      bySource.length > 0
        ? bySource.reduce((a, b) =>
            new Date(a.lastIngested) > new Date(b.lastIngested) ? a : b,
          ).lastIngested
        : null;

    res.json({ totalJobs, bySource, lastIngested });
  }),
);

// POST /api/admin/ingest — manually trigger a full ingestion run
router.post(
  "/ingest",
  requireDb,
  asyncHandler(async (_req, res) => {
    console.log("[admin] Manual ingestion triggered.");
    const summary = await runIngestion(ADAPTERS);
    res.json({ summary });
  }),
);

export default router;
