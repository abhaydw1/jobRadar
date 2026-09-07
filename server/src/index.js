import "dotenv/config";
import crypto from "node:crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
import jobsRouter from "./routes/jobs.js";
import usersRouter from "./routes/users.js";
import adminRouter from "./routes/admin.js";
import { startScheduler } from "./scheduler.js";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
  console.warn(
    "[auth] JWT_SECRET not set — using a temporary secret for this run only. " +
      "Set JWT_SECRET in server/.env so sessions survive a restart.",
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/admin", adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
  });
  // Start the ingestion scheduler after DB is connected
  startScheduler();
}

start();
