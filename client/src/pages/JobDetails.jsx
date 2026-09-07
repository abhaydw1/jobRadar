import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useSavedJobs } from "../hooks/useSavedJobs";

const EXPERIENCE_LABELS = {
  internship: "Internship",
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
};

export default function JobDetails() {
  const { id } = useParams();
  const { savedIds, toggleSave } = useSavedJobs();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getJob(id)
      .then((data) => setJob(data.job))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Loading job...
      </p>
    );
  }

  if (error || !job) {
    return (
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {error || "Job not found."}
        </p>
        <Link to="/jobs" className="mt-2 inline-block text-sm underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const saved = savedIds.has(job.id);
  const hasMatch = typeof job.matchScore === "number" && job.matchScore > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/jobs"
        className="mb-6 inline-block text-sm text-gray-600 underline dark:text-gray-400"
      >
        ← Back to jobs
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {job.company} · {job.location}
            {job.remote && job.location !== "Remote" ? " · Remote" : ""}
          </p>
          {hasMatch && (
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              {job.matchScore}% match
              {job.matchReasons?.length > 0 && (
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  ({job.matchReasons.join(" · ")})
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => toggleSave(job.id)}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              saved
                ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            {saved ? "Saved" : "Save"}
          </button>
          {job.sourceUrl && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Apply ↗
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {EXPERIENCE_LABELS[job.experienceLevel] ?? job.experienceLevel}
        </span>
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-6 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
        {job.description}
      </p>

      {job.postedAt && (
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
