import { Link } from "react-router-dom";

const EXPERIENCE_LABELS = {
  internship: "Internship",
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
};

export default function JobCard({ job, saved, onToggleSave }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/jobs/${job.id}`}
            className="text-base font-semibold text-gray-900 hover:underline dark:text-white"
          >
            {job.title}
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {job.company} · {job.location}
            {job.remote && job.location !== "Remote" ? " · Remote" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleSave(job.id)}
          className={`shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium ${
            saved
              ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {job.description}
      </p>
    </div>
  );
}
