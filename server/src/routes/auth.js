import { Router } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COOKIE_NAME, cookieOptions, signToken } from "../utils/token.js";
import { toPublicUser } from "../utils/publicUser.js";

const router = Router();

router.post(
  "/register",
  requireDb,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
    res.status(201).json({ user: toPublicUser(user) });
  }),
);

router.post(
  "/login",
  requireDb,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
    res.json({ user: toPublicUser(user) });
  }),
);

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.status(204).end();
});

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

export default router;
