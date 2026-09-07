import { Router } from "express";

import User from "../models/User.js";
import { EXPERIENCE_LEVELS } from "../constants/experienceLevels.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toPublicUser } from "../utils/publicUser.js";

const router = Router();

const MAX_TAGS = 25;
const MAX_TAG_LENGTH = 60;

function sanitizeTags(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const tags = [];

  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const tag = raw.trim();
    if (!tag || tag.length > MAX_TAG_LENGTH) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= MAX_TAGS) break;
  }

  return tags;
}

function sanitizeExperienceLevels(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)].filter((level) =>
    EXPERIENCE_LEVELS.includes(level),
  );
}

// GET /api/users/me
router.get(
  "/me",
  requireAuth,
  requireDb,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    res.json({ user: toPublicUser(user) });
  }),
);

// PATCH /api/users/me/preferences
router.patch(
  "/me/preferences",
  requireAuth,
  requireDb,
  asyncHandler(async (req, res) => {
    const { roles, locations, experienceLevels, skills, companies } =
      req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    user.preferences = {
      roles: sanitizeTags(roles),
      locations: sanitizeTags(locations),
      experienceLevels: sanitizeExperienceLevels(experienceLevels),
      skills: sanitizeTags(skills),
      companies: sanitizeTags(companies),
    };

    await user.save();
    res.json({ user: toPublicUser(user) });
  }),
);

export default router;
