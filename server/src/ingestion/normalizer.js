import { EXPERIENCE_LEVELS } from "../constants/experienceLevels.js";

const KNOWN_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Ruby",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Django",
  "Spring Boot",
  "AWS",
  "Docker",
  "Kubernetes",
  "Terraform",
  "GraphQL",
  "Tailwind CSS",
  "CSS",
  "Cypress",
  "PyTorch",
  "System Design",
];

const SENIOR_KEYWORDS = ["senior", "staff", "principal", "lead", "director"];
const JUNIOR_KEYWORDS = ["junior", "entry level", "entry-level", "associate"];
const INTERN_KEYWORDS = ["intern", "internship", "working student"];

function decodeEntitiesOnce(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'");
}

// Greenhouse's content field has inconsistent encoding depth within the same
// document (e.g. "&amp;nbsp;" but "&amp;amp;D" a few lines later), so entities
// are unwrapped repeatedly until a pass produces no further change.
function decodeEntities(str) {
  let current = str;
  for (let i = 0; i < 5; i += 1) {
    const next = decodeEntitiesOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
}

function stripHtml(html) {
  if (!html) return "";
  const decoded = decodeEntities(html);
  return decoded
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferExperienceLevel(title) {
  const t = title.toLowerCase();
  if (INTERN_KEYWORDS.some((kw) => t.includes(kw))) return "internship";
  if (SENIOR_KEYWORDS.some((kw) => t.includes(kw))) return "senior";
  if (JUNIOR_KEYWORDS.some((kw) => t.includes(kw))) return "entry";
  return "mid";
}

function inferRemote(location) {
  return /remote/i.test(location);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkills(title, description) {
  const haystack = `${title} ${description}`;
  return KNOWN_SKILLS.filter((skill) => {
    const pattern = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
    return pattern.test(haystack);
  });
}

export function normalizeRawJob(rawJob) {
  // Ashby provides plain text directly; Greenhouse provides HTML that needs stripping.
  const description = rawJob.descriptionPlain
    ? rawJob.descriptionPlain.replace(/\s+/g, " ").trim()
    : stripHtml(rawJob.descriptionHtml);
  const experienceLevel = EXPERIENCE_LEVELS.includes(rawJob.experienceLevel)
    ? rawJob.experienceLevel
    : inferExperienceLevel(rawJob.title);

  return {
    title: rawJob.title.trim(),
    company: rawJob.company.trim(),
    location: rawJob.location.trim() || "Unspecified",
    remote: typeof rawJob.remote === "boolean" ? rawJob.remote : inferRemote(rawJob.location),
    experienceLevel,
    skills: extractSkills(rawJob.title, description),
    description: description || "No description provided.",
    postedAt: rawJob.postedAt,
    source: rawJob.source,
    sourceCompany: rawJob.sourceCompany ?? null,
    sourceJobId: rawJob.sourceJobId,
    sourceUrl: rawJob.sourceUrl,
  };
}

