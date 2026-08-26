import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TagInput from "../components/TagInput";

const EXPERIENCE_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "entry", label: "Entry level (0–2 years)" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
];

export default function Preferences() {
  const { user, updatePreferences } = useAuth();
  const [form, setForm] = useState({
    roles: user?.preferences?.roles ?? [],
    locations: user?.preferences?.locations ?? [],
    experienceLevels: user?.preferences?.experienceLevels ?? [],
    skills: user?.preferences?.skills ?? [],
    companies: user?.preferences?.companies ?? [],
  });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [saving, setSaving] = useState(false);

  function toggleExperience(value) {
    setForm((f) => ({
      ...f,
      experienceLevels: f.experienceLevels.includes(value)
        ? f.experienceLevels.filter((v) => v !== value)
        : [...f.experienceLevels, value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: "" });
    try {
      await updatePreferences(form);
      setStatus({ type: "success", message: "Preferences saved." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold">Job preferences</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Tell us what you're looking for. You can change this anytime.
      </p>

      {status.type && (
        <p
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            status.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {status.message}
        </p>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <TagInput
          label="Roles"
          tags={form.roles}
          onChange={(roles) => setForm((f) => ({ ...f, roles }))}
          placeholder="e.g. Backend Engineer, SDE Intern"
        />

        <TagInput
          label="Locations"
          tags={form.locations}
          onChange={(locations) => setForm((f) => ({ ...f, locations }))}
          placeholder="e.g. Bangalore, Remote"
        />

        <div className="flex flex-col gap-2 text-sm">
          <span>Experience level</span>
          <div className="flex flex-wrap gap-4">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={form.experienceLevels.includes(opt.value)}
                  onChange={() => toggleExperience(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <TagInput
          label="Skills"
          tags={form.skills}
          onChange={(skills) => setForm((f) => ({ ...f, skills }))}
          placeholder="e.g. React, Python"
        />

        <TagInput
          label="Companies (optional)"
          tags={form.companies}
          onChange={(companies) => setForm((f) => ({ ...f, companies }))}
          placeholder="e.g. Google, Amazon"
        />

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
      </form>
    </div>
  );
}
