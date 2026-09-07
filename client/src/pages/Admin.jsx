import { useEffect, useState } from "react";
import { api } from "../lib/api";

function formatDate(iso) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString();
}

function timeAgo(iso) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [ingestRunning, setIngestRunning] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [ingestError, setIngestError] = useState("");

  function loadStats() {
    setStatsLoading(true);
    setStatsError("");
    api
      .getAdminStats()
      .then(setStats)
      .catch((err) => setStatsError(err.message))
      .finally(() => setStatsLoading(false));
  }

  useEffect(loadStats, []);

  async function handleTriggerIngest() {
    setIngestRunning(true);
    setIngestResult(null);
    setIngestError("");
    try {
      const data = await api.triggerIngest();
      setIngestResult(data.summary);
      // Refresh stats after ingest
      loadStats();
    } catch (err) {
      setIngestError(err.message);
    } finally {
      setIngestRunning(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Admin Dashboard</h1>

      {/* Stats panel */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">Job Database</h2>
        {statsLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading stats…</p>
        ) : statsError ? (
          <p className="text-sm text-red-700 dark:text-red-400">{statsError}</p>
        ) : stats ? (
          <div className="rounded-md border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <span className="text-sm font-medium">Total jobs</span>
              <span className="font-mono text-sm">{stats.totalJobs.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Last ingested
              </span>
              <span className="text-sm">
                {formatDate(stats.lastIngested)}{" "}
                <span className="text-gray-500">({timeAgo(stats.lastIngested)})</span>
              </span>
            </div>

            {/* Per-source breakdown */}
            {stats.bySource.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                        Source
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                        Company
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                        Jobs
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                        Last run
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.bySource.map((row) => (
                      <tr
                        key={`${row.source}-${row.company}`}
                        className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                      >
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {row.source}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {row.company ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">
                          {row.count.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400">
                          {timeAgo(row.lastIngested)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Manual ingest trigger */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Manual Ingestion</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Trigger a full ingestion run across all sources. The scheduler also runs this
          automatically every 6 hours.
        </p>

        <button
          type="button"
          onClick={handleTriggerIngest}
          disabled={ingestRunning}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {ingestRunning ? "Running…" : "Run ingestion now"}
        </button>

        {ingestError && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-400">{ingestError}</p>
        )}

        {ingestResult && (
          <div className="mt-4 rounded-md border border-gray-200 dark:border-gray-800">
            <p className="border-b border-gray-200 px-4 py-2 text-sm font-medium dark:border-gray-800">
              Run complete
            </p>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {ingestResult.map((entry, i) => (
                <li key={i} className="px-4 py-2 text-sm">
                  {entry.status === "ok" ? (
                    <span>
                      <span className="font-medium">{entry.source}</span> — found{" "}
                      {entry.found}, inserted{" "}
                      <span className="text-green-700 dark:text-green-400">
                        {entry.inserted}
                      </span>
                      , updated {entry.updated}
                    </span>
                  ) : (
                    <span>
                      <span className="font-medium">{entry.source}</span>{" "}
                      <span className="text-red-700 dark:text-red-400">
                        FAILED — {entry.error}
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
