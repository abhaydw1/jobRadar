import mongoose from "mongoose";

export function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database is not connected." });
  }
  next();
}
