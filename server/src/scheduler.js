import cron from "node-cron";
import { createGreenhouseAdapter } from "./ingestion/sources/greenhouse.js";
import { createAshbyAdapter } from "./ingestion/sources/ashby.js";
import { runIngestion } from "./ingestion/orchestrator.js";
import { sendDigests } from "./services/notifier.js";

// Canonical adapter list — single source of truth for both scheduler and admin trigger.
// ingest.js (manual script) has its own copy for standalone use.
export const ADAPTERS = [
  createGreenhouseAdapter({ companyToken: "gitlab", companyName: "GitLab" }),
  createGreenhouseAdapter({ companyToken: "stripe", companyName: "Stripe" }),
  createAshbyAdapter({ companySlug: "ramp", companyName: "Ramp" }),
  createAshbyAdapter({ companySlug: "notion", companyName: "Notion" }),
];

async function runAll() {
  console.log("[scheduler] Starting scheduled ingestion run…");
  const summary = await runIngestion(ADAPTERS);

  console.log("[scheduler] Ingestion summary:");
  for (const entry of summary) {
    if (entry.status === "ok") {
      console.log(
        `  - ${entry.source}: found ${entry.found}, inserted ${entry.inserted}, updated ${entry.updated}`,
      );
    } else {
      console.log(`  - ${entry.source}: FAILED — ${entry.error}`);
    }
  }

  // After ingestion, send digest emails for any new matches
  await sendDigests();
}

/**
 * startScheduler() — call once after DB connects.
 * Schedule: every 6 hours ( 0 *\/6 * * * )
 */
export function startScheduler() {
  console.log("[scheduler] Scheduler started — ingestion will run every 6 hours.");

  // Run once on startup so the DB is fresh immediately
  runAll().catch((err) =>
    console.error("[scheduler] Startup ingestion failed:", err.message),
  );

  // Then every 6 hours
  cron.schedule("0 */6 * * *", () => {
    runAll().catch((err) =>
      console.error("[scheduler] Scheduled ingestion failed:", err.message),
    );
  });
}
