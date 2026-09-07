import nodemailer from "nodemailer";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import { scoreJob } from "../ingestion/matcher.js";

const MATCH_THRESHOLD = 30;

/**
 * Build a Nodemailer transport from env vars.
 * Returns null (with a console warning) if SMTP is not configured —
 * so the app runs fine in development without email setup.
 */
function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "[notifier] SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing). " +
        "Email digests will be skipped. Set these in server/.env to enable notifications.",
    );
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    secure: parseInt(SMTP_PORT || "587") === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Build the plain-text and HTML body for a digest email.
 */
function buildEmailBody(userName, matchedJobs) {
  const jobLines = matchedJobs
    .map(
      (j) =>
        `• ${j.title} at ${j.company} (${j.location})\n  ${j.sourceUrl}\n  Match: ${j.matchScore}% — ${(j.matchReasons ?? []).join(", ")}`,
    )
    .join("\n\n");

  const text = `Hi ${userName},\n\nHere are your new job matches on JobRadar:\n\n${jobLines}\n\nVisit JobRadar to save and track your applications.\n`;

  const htmlJobs = matchedJobs
    .map(
      (j) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #eee;">
        <strong><a href="${j.sourceUrl}" style="color:#111; text-decoration:none;">${j.title}</a></strong><br>
        <span style="color:#555;">${j.company} · ${j.location}</span><br>
        <span style="color:#16a34a; font-size:12px;">${j.matchScore}% match — ${(j.matchReasons ?? []).join(", ")}</span>
      </td>
    </tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif; color:#111; max-width:560px; margin:0 auto; padding:24px;">
  <h2 style="margin-bottom:4px;">Your JobRadar digest</h2>
  <p style="color:#555; margin-top:0;">Hi ${userName} — here are ${matchedJobs.length} new job${matchedJobs.length !== 1 ? "s" : ""} matching your preferences:</p>
  <table style="width:100%; border-collapse:collapse;">${htmlJobs}</table>
  <p style="margin-top:24px; font-size:12px; color:#888;">You're receiving this because you have an account on JobRadar. Update your preferences anytime to change what you see.</p>
</body>
</html>`;

  return { text, html };
}

/**
 * sendDigests() — called after each ingestion run.
 *
 * For each user with preferences set:
 *   1. Find all jobs that score ≥ MATCH_THRESHOLD against their preferences
 *   2. Remove any already in the Notification collection for this user
 *   3. Send a single digest email with the remainder
 *   4. Insert Notification records so the same jobs aren't re-sent
 */
export async function sendDigests() {
  const transport = createTransport();
  if (!transport) return; // SMTP not configured — skip silently

  const FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

  let usersProcessed = 0;
  let emailsSent = 0;

  try {
    const users = await User.find({}).lean();
    const allJobs = await Job.find({}).lean();

    for (const user of users) {
      const prefs = user.preferences;
      const hasPrefs =
        prefs &&
        (prefs.roles?.length ||
          prefs.skills?.length ||
          prefs.experienceLevels?.length ||
          prefs.locations?.length ||
          prefs.companies?.length);

      if (!hasPrefs) continue;

      // Score all jobs for this user
      const scored = allJobs
        .map((job) => {
          const { score, reasons } = scoreJob(job, prefs);
          return { ...job, matchScore: score, matchReasons: reasons };
        })
        .filter((j) => j.matchScore >= MATCH_THRESHOLD);

      if (scored.length === 0) continue;

      // Find which jobs have already been notified
      const jobIds = scored.map((j) => j._id);
      const alreadySent = await Notification.find({
        userId: user._id,
        jobId: { $in: jobIds },
      })
        .select("jobId")
        .lean();
      const alreadySentSet = new Set(alreadySent.map((n) => n.jobId.toString()));

      const newMatches = scored.filter(
        (j) => !alreadySentSet.has(j._id.toString()),
      );
      if (newMatches.length === 0) continue;

      // Send digest email
      const { text, html } = buildEmailBody(user.name, newMatches);
      try {
        await transport.sendMail({
          from: `"JobRadar" <${FROM}>`,
          to: user.email,
          subject: `${newMatches.length} new job match${newMatches.length !== 1 ? "es" : ""} for you`,
          text,
          html,
        });

        // Record notifications (ignore duplicate key errors — idempotent)
        const docs = newMatches.map((j) => ({
          userId: user._id,
          jobId: j._id,
          sentAt: new Date(),
        }));
        await Notification.insertMany(docs, { ordered: false }).catch(() => {});

        emailsSent += 1;
        console.log(
          `[notifier] Sent digest to ${user.email} — ${newMatches.length} new match(es)`,
        );
      } catch (sendErr) {
        console.error(`[notifier] Failed to send to ${user.email}:`, sendErr.message);
      }

      usersProcessed += 1;
    }
  } catch (err) {
    console.error("[notifier] sendDigests error:", err.message);
  }

  console.log(
    `[notifier] Done. Processed ${usersProcessed} user(s), sent ${emailsSent} digest(s).`,
  );
}
