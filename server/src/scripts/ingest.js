import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { createGreenhouseAdapter } from "../ingestion/sources/greenhouse.js";
import { createAshbyAdapter } from "../ingestion/sources/ashby.js";
import { runIngestion } from "../ingestion/orchestrator.js";

const ADAPTERS = [
  createGreenhouseAdapter({ companyToken: "gitlab", companyName: "GitLab" }),
  createGreenhouseAdapter({ companyToken: "stripe", companyName: "Stripe" }),
  createAshbyAdapter({ companySlug: "ramp", companyName: "Ramp" }),
  createAshbyAdapter({ companySlug: "notion", companyName: "Notion" }),
];

async function main() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error("[ingest] Could not connect to the database. Aborting.");
    process.exit(1);
  }

  const summary = await runIngestion(ADAPTERS);

  console.log("[ingest] Run summary:");
  for (const entry of summary) {
    if (entry.status === "ok") {
      console.log(
        `  - ${entry.source}: found ${entry.found}, inserted ${entry.inserted}, updated ${entry.updated}`,
      );
    } else {
      console.log(`  - ${entry.source}: FAILED — ${entry.error}`);
    }
  }

  await mongoose.disconnect();
}

main();
