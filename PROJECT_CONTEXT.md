# JobRadar — Project Context (for picking this back up)

Last updated: 2026-09-01. Read this first in a new session before doing anything else.

## Working agreement (do not skip this)

- Build **one phase / one small step at a time**. Inspect existing code first, explain the plan, flag real architectural decisions and ask before deciding them, implement one logical chunk, test it, report exactly what changed.
- **Wait for explicit go-ahead before moving to the next step.** The user has repeatedly corrected drift from this — do not implement multiple steps in a row without approval in between.
- Do not touch unrelated/working code. Keep the project runnable after every step.
- Report any decision you're making instead of silently making it (e.g. clearing stale data, changing a decode order, dropping a false-positive-prone value) — even small ones.
- Verify claims against the live system (curl, direct DB queries, the browser) rather than trusting docs or memory — this has caught multiple real bugs already (see below).

## What JobRadar is

A MERN job discovery/notification platform. React (Vite) + Tailwind frontend, Node/Express backend, MongoDB Atlas via Mongoose. Admin-only areas are distinct from normal user pages — `role` field + `requireAdmin` middleware active and in use.

## Status: All Phases Complete

| Phase | Status |
|---|---|
| 1 Foundation | Done |
| 2 Branding/UI | Done — "JobRadar", Tailwind, dark mode toggle |
| 3 Auth | Done — JWT in HttpOnly cookie |
| 4 User & Preferences | Done — free-form tag preferences, optional onboarding |
| 5 Job UI (mock data) | Done, later superseded by Phase 6 |
| 6 Job DB | Done — real `Job` model, mock data replaced |
| 7 First ingestion | Done — Greenhouse/GitLab, real jobs live in MongoDB |
| 8 Multi-source (Greenhouse) | **Done** — GitLab + Stripe both ingesting via Greenhouse |
| 9 Second ATS (Ashby) | **Done** — Vercel + Notion via Ashby API |
| 10 Matching engine | **Done** — `scoreJob()`, matchScore on all job endpoints, Matched tab in UI |
| 11 Scheduler | **Done** — `node-cron` every 6h, auto-starts on server boot |
| 12 Email notifications | **Done** — Nodemailer digest, Notification model with dedup index |
| 13 Admin dashboard | **Done** — /admin route (frontend + backend), stats + manual ingest trigger |
| 14 Polish | **Done** — Apply button, paginated API, Dashboard with real match count, .env docs |

## What's running right now

- **4 ingestion sources:** GitLab (Greenhouse), Stripe (Greenhouse), Vercel (Ashby), Notion (Ashby)
- **Scheduler:** runs ingestion + email digests every 6 hours automatically on server start
- **Matching:** rule-based scoring on every job API response, sorted by score DESC
- **Admin:** `/admin` route (frontend) + `/api/admin/stats` + `/api/admin/ingest` (backend)
- **Notifications:** digest emails via Nodemailer — configure SMTP vars in `.env` to activate

To start dev servers:
```
cd server && npm run dev    # port 5000
cd client && npm run dev    # port 5173
```

Watch for orphaned Node processes on port 5000 after a crash:
```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'"
```

## Key architecture decisions already made

- **Auth:** JWT in an HttpOnly cookie. `requireAuth` / `requireAdmin` middleware in `server/src/middleware/auth.js`.
- **Database:** MongoDB Atlas, database name is `jobFinder` (capital F — this matters, was explicitly corrected once).
- **User preferences:** free-form tags for roles/locations/skills/companies; fixed enum for experience level (`internship`/`entry`/`mid`/`senior`). Onboarding is optional, anytime.
- **Saved jobs:** deliberately still in browser `localStorage`, not MongoDB.
- **Job schema source-tracking fields:** `source`, `sourceCompany`, `sourceJobId`, `sourceUrl`. Unique compound index on `(source, sourceCompany, sourceJobId)` — company identity is part of the dedup key.
- **Ingestion architecture:** "Extraction Ladder" — three interchangeable adapter tiers (API / HTML scraping / browser automation + AI), all producing the same `RawJob[]` shape. Currently only Rung 1 (API) is in use. Tier is chosen once per source, by hand, not as an automatic runtime fallback.
- **Ingestion pipeline:** `greenhouse.js` / `ashby.js` → `normalizer.js` → `orchestrator.js` → upsert into MongoDB.
- **Ashby adapter note:** Ashby provides `descriptionPlain` (plain text). The normalizer skips HTML stripping when this field is present; Greenhouse still goes through the entity-decode + HTML-strip path.
- **Scheduling:** `node-cron` in-process, every 6 hours. No Redis/BullMQ/Kafka — deliberate choice. Rung 3 sources (if added later) should get a slower independent schedule.
- **Matching:** deterministic rule-based — role (+40), skills (+5 each), experience level (+20), location (+10), company (+20). Threshold for "Matched" tab: ≥30 pts. Computed on-demand per API call.
- **Notifications:** email digest (batched, not one-per-job). Dedup via `(userId, jobId)` unique index on `Notification` collection. SMTP configured via env vars; silently skipped if not set.
- **Admin:** role promoted manually in MongoDB Atlas. `/admin` frontend visible only to `role: "admin"` users.

## File map (complete, as of Phase 14)

```
server/src/
  constants/experienceLevels.js
  models/
    Job.js               — source tracking fields + unique compound index
    User.js              — role field, preferences subdocument
    Notification.js      — (userId, jobId) unique index for email dedup
  ingestion/
    normalizer.js        — shared; handles both HTML (Greenhouse) and plain text (Ashby)
    orchestrator.js      — loops adapters, upserts, isolates failures per source
    matcher.js           — scoreJob(job, preferences) → { score, reasons }
    sources/
      greenhouse.js      — createGreenhouseAdapter({ companyToken, companyName })
      ashby.js           — createAshbyAdapter({ companySlug, companyName })
  services/
    notifier.js          — sendDigests() — email digest after each ingestion run
  scheduler.js           — startScheduler() — node-cron every 6h; ADAPTERS list lives here
  routes/
    auth.js
    health.js
    jobs.js              — GET /api/jobs (paginated, scored, sorted), GET /api/jobs/:id
    users.js             — GET /api/users/me, PATCH /api/users/me/preferences
    admin.js             — GET /api/admin/stats, POST /api/admin/ingest (requireAdmin)
  scripts/
    ingest.js            — standalone manual trigger (own ADAPTERS copy)
    seedJobs.js          — Phase 6 placeholder, superseded, data cleared
  middleware/
    auth.js              — requireAuth, requireAdmin
    requireDb.js
  utils/
    asyncHandler.js
    publicUser.js
    token.js
  config/db.js
  index.js               — Express app, registers all routers, calls startScheduler()

client/src/
  pages/
    Landing.jsx, Login.jsx, Register.jsx
    Dashboard.jsx        — real match count, CTAs, admin sees last ingestion time
    Preferences.jsx      — tag inputs for roles/locations/skills/companies + experience level
    Jobs.jsx             — All / Matched / Saved tabs, filters, pagination
    JobDetails.jsx       — match score + reasons, Save button, Apply button → sourceUrl
    Admin.jsx            — stats table, manual ingest trigger (admin only)
  components/
    Layout.jsx, Navbar.jsx (Admin link for admin users), ProtectedRoute.jsx
    AdminRoute.jsx       — requires auth + role === "admin"
    JobCard.jsx          — green match score badge when score > 0
    TagInput.jsx, ThemeToggle.jsx
  context/AuthContext.jsx
  hooks/useSavedJobs.js, useTheme.js
  lib/api.js             — all API calls incl. getJobs({page,limit}), admin endpoints
```

## Real bugs found and fixed (worth knowing before touching this code again)

1. Mongoose's automatic `id` virtual is **not** included in `toJSON()` output by default — required `toJSON: { virtuals: true }` on the `Job` schema, or `job.id` comes back `undefined` on the frontend.
2. Greenhouse's `content` field is HTML-entity-encoded, and **inconsistently double-encoded** within the same document. Fixed by decoding in a loop until the string stops changing.
3. Naive substring skill-matching produced false positives ("Go" matched inside "ne**go**tiations"). Fixed with word-boundary regex. Dropped "Go" from KNOWN_SKILLS — legitimate collision risk for short common-English-word skills.
