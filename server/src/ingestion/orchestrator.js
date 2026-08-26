import Job from "../models/Job.js";
import { normalizeRawJob } from "./normalizer.js";

export async function runIngestion(adapters) {
  const summary = [];

  for (const adapter of adapters) {
    const label = adapter.sourceCompany
      ? `${adapter.source}:${adapter.sourceCompany}`
      : adapter.source;

    try {
      const rawJobs = await adapter.fetchJobs();
      let inserted = 0;
      let updated = 0;

      for (const rawJob of rawJobs) {
        const normalized = normalizeRawJob(rawJob);
        const result = await Job.findOneAndUpdate(
          {
            source: normalized.source,
            sourceCompany: normalized.sourceCompany,
            sourceJobId: normalized.sourceJobId,
          },
          { $set: normalized },
          { upsert: true, new: false },
        );
        if (result === null) {
          inserted += 1;
        } else {
          updated += 1;
        }
      }

      summary.push({
        source: label,
        status: "ok",
        found: rawJobs.length,
        inserted,
        updated,
      });
    } catch (err) {
      summary.push({
        source: label,
        status: "failed",
        error: err.message,
      });
    }
  }

  return summary;
}
