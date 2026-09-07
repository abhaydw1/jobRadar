/**
 * Rule-based matching engine — deterministic, no ML.
 *
 * scoreJob(job, preferences) → { score: Number, reasons: String[] }
 *
 * Scoring rules:
 *   Role match    : job title contains any user roles tag         → +40 pts (one match sufficient)
 *   Skill match   : job.skills intersects user skills             → +5 pts per skill (uncapped)
 *   Level match   : job.experienceLevel in user experienceLevels  → +20 pts
 *   Location match: job.location contains user locations tag,
 *                   OR job is remote + user has "remote" in locs  → +10 pts (one match sufficient)
 *   Company match : job.company (case-insensitive) in user comps  → +20 pts
 */
export function scoreJob(job, preferences) {
  if (!preferences) return { score: 0, reasons: [] };

  const {
    roles = [],
    skills = [],
    experienceLevels = [],
    locations = [],
    companies = [],
  } = preferences;

  let score = 0;
  const reasons = [];

  // --- Role match (+40) ---
  if (roles.length > 0) {
    const titleLower = job.title.toLowerCase();
    const matched = roles.find((r) => titleLower.includes(r.toLowerCase()));
    if (matched) {
      score += 40;
      reasons.push(`Role: "${matched}"`);
    }
  }

  // --- Skill match (+5 per skill) ---
  if (skills.length > 0 && job.skills && job.skills.length > 0) {
    const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
    const matchedSkills = skills.filter((s) =>
      jobSkillsLower.includes(s.toLowerCase()),
    );
    if (matchedSkills.length > 0) {
      score += matchedSkills.length * 5;
      reasons.push(`Skills: ${matchedSkills.join(", ")}`);
    }
  }

  // --- Experience level match (+20) ---
  if (experienceLevels.length > 0) {
    if (experienceLevels.includes(job.experienceLevel)) {
      score += 20;
      reasons.push(`Level: ${job.experienceLevel}`);
    }
  }

  // --- Location match (+10) ---
  if (locations.length > 0) {
    const locLower = job.location.toLowerCase();
    const hasRemotePref = locations.some((l) => l.toLowerCase() === "remote");
    const locationMatched =
      (job.remote && hasRemotePref) ||
      locations.some((l) => locLower.includes(l.toLowerCase()));
    if (locationMatched) {
      score += 10;
      reasons.push(`Location: ${job.location}`);
    }
  }

  // --- Company preference match (+20) ---
  if (companies.length > 0) {
    const companyLower = job.company.toLowerCase();
    const matched = companies.find((c) => companyLower === c.toLowerCase());
    if (matched) {
      score += 20;
      reasons.push(`Company: "${matched}"`);
    }
  }

  return { score, reasons };
}
