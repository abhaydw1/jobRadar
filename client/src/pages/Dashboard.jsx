import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const MATCH_THRESHOLD = 30;

function hasNoPreferences(preferences) {
  if (!preferences) return true;
  return (
    preferences.roles.length === 0 &&
    preferences.locations.length === 0 &&
    preferences.experienceLevels.length === 0 &&
    preferences.skills.length === 0
  );
}

function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours >= 24) return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours}h ${mins}m ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [matchedCount, setMatchedCount] = useState(null);
  const [lastIngested, setLastIngested] = useState(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    // Fetch first page of scored jobs to derive matched count
    api
      .getJobs({ page: 1, limit: 50 })
      .then((data) => {
        const count = data.jobs.filter(
          (j) => (j.matchScore ?? 0) >= MATCH_THRESHOLD,
        ).length;
        setMatchedCount(count);
      })
      .catch(() => {})
      .finally(() => setStatsLoaded(true));

    // Fetch last ingestion time if user is admin
    if (user?.role === "admin") {
      api
        .getAdminStats()
        .then((data) => setLastIngested(data.lastIngested))
        .catch(() => {});
    }
  }, [user?.role]);

  const noPrefs = hasNoPreferences(user?.preferences);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {user?.name}.</h1>

      {noPrefs ? (
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
          You haven't set your job preferences yet.{" "}
          <Link to="/preferences" className="font-medium underline">
            Set them now
          </Link>{" "}
          so we know what to look for.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {statsLoaded && matchedCount !== null && (
            <p className="text-gray-600 dark:text-gray-400">
              {matchedCount > 0 ? (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {matchedCount}
                  </span>{" "}
                  job{matchedCount !== 1 ? "s" : ""} match your preferences on this page.{" "}
                  <Link to="/jobs" className="underline">
                    View matched jobs →
                  </Link>
                </>
              ) : (
                <>
                  No strong matches yet.{" "}
                  <Link to="/preferences" className="underline">
                    Refine your preferences
                  </Link>{" "}
                  or{" "}
                  <Link to="/jobs" className="underline">
                    browse all jobs
                  </Link>
                  .
                </>
              )}
            </p>
          )}

          <div className="flex gap-3">
            <Link
              to="/jobs"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Browse jobs
            </Link>
            <Link
              to="/preferences"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Edit preferences
            </Link>
          </div>
        </div>
      )}

      {lastIngested && (
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          Last job refresh: {timeAgo(lastIngested)}
        </p>
      )}
    </div>
  );
}
