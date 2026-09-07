import { useEffect, useMemo, useState } from "react";
import JobCard from "../components/JobCard";
import { api } from "../lib/api";
import { useSavedJobs } from "../hooks/useSavedJobs";

const EXPERIENCE_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
];

const MATCH_THRESHOLD = 30;

function tabButtonClass(active) {
  return `rounded-md border px-3 py-1.5 text-sm font-medium ${
    active
      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
      : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
  }`;
}

export default function Jobs() {
  const { savedIds, toggleSave } = useSavedJobs();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [location, setLocation] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getJobs({ page, limit: 50 })
      .then((data) => {
        setJobs(data.jobs);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].sort(),
    [jobs],
  );

  function toggleExperience(value) {
    setExperienceLevels((levels) =>
      levels.includes(value)
        ? levels.filter((v) => v !== value)
        : [...levels, value],
    );
  }

  function changeTab(newTab) {
    setTab(newTab);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (tab === "saved" && !savedIds.has(job.id)) return false;
      if (tab === "matched" && (job.matchScore ?? 0) < MATCH_THRESHOLD) return false;
      if (
        experienceLevels.length &&
        !experienceLevels.includes(job.experienceLevel)
      )
        return false;
      if (location !== "all" && job.location !== location) return false;
      if (q) {
        const haystack = [job.title, job.company, job.location, ...job.skills]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, tab, query, experienceLevels, location, savedIds]);

  const matchedCount = useMemo(
    () => jobs.filter((j) => (j.matchScore ?? 0) >= MATCH_THRESHOLD).length,
    [jobs],
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => changeTab("all")}
            className={tabButtonClass(tab === "all")}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => changeTab("matched")}
            className={tabButtonClass(tab === "matched")}
          >
            Matched {matchedCount > 0 ? `(${matchedCount})` : ""}
          </button>
          <button
            type="button"
            onClick={() => changeTab("saved")}
            className={tabButtonClass(tab === "saved")}
          >
            Saved ({savedIds.size})
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
            Search
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, company, or skill"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        {EXPERIENCE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
          >
            <input
              type="checkbox"
              checked={experienceLevels.includes(opt.value)}
              onChange={() => toggleExperience(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading jobs...
        </p>
      ) : error ? (
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {tab === "saved"
            ? "You haven't saved any jobs yet."
            : tab === "matched"
              ? "No matched jobs yet — update your preferences to see matches."
              : "No jobs match your filters."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedIds.has(job.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
