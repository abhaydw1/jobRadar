# JobRadar — Project Context (for picking this back up)

Last updated: 2026-08-23. Read this first in a new session before doing anything else.

## Working agreement (do not skip this)

- Build **one phase / one small step at a time**. Inspect existing code first, explain the plan, flag real architectural decisions and ask before deciding them, implement one logical chunk, test it, report exactly what changed.
- **Wait for explicit go-ahead before moving to the next step.** The user has repeatedly corrected drift from this — do not implement multiple steps in a row without approval in between.
- Do not touch unrelated/working code. Keep the project runnable after every step.
- Report any decision you're making instead of silently making it (e.g. clearing stale data, changing a decode order, dropping a false-positive-prone value) — even small ones.
- Verify claims against the live system (curl, direct DB queries, the browser) rather than trusting docs or memory — this has caught multiple real bugs already (see below).

## What JobRadar is

A MERN job discovery/notification platform. React (Vite) + Tailwind frontend, Node/Express backend, MongoDB Atlas via Mongoose. Owner wants eventual admin-only areas distinct from normal user pages (role field + `requireAdmin` middleware already scaffolded for this, unused so far).

Three planning documents were published as artifacts and are the source of truth for architecture — re-read them before proposing anything that touches these areas:

- **[The JobRadar Blueprint](https://claude.ai/code/artifact/5ded45d1-6903-4f02-a44f-648b1d46d2cc)** — full roadmap, Phase 7 → production, all 11 architecture questions (ingestion, processing, matching, notifications, scheduling, database, admin, security, frontend).
- **[Signal Check](https://claude.ai/code/artifact/66c8453b-4e58-45ca-b8f3-6fb0dac5080d)** — live evaluation of Arbeitnow / RemoteOK / Greenhouse as the first ingestion source. Recommended and chose Greenhouse.
- **[The Extraction Ladder](https://claude.ai/code/artifact/8a132106-7abc-4b56-bbe5-62d4b9fcd799)** — the three-tier ingestion architecture (API → HTML scraping → browser automation + AI extraction), all sharing one `RawJob` adapter contract.

## Status: Phases 1–7 done, Phase 8 in progress (not yet implemented)

| Phase | Status |
|---|---|
| 1 Foundation | Done |
| 2 Branding/UI | Done — "JobRadar", Tailwind, dark mode toggle |
| 3 Auth | Done — JWT in HttpOnly cookie |
| 4 User & Preferences | Done — free-form tag preferences, optional onboarding |
| 5 Job UI (mock data) | Done, later superseded by Phase 6 |
| 6 Job DB | Done — real `Job` model, mock data replaced |
| 7 First ingestion | **Done** — Greenhouse/GitLab, 204 real jobs live in MongoDB, verified end-to-end |
| 8 Multi-source | **In progress.** Proposed and awaiting approval: add Stripe as a second Greenhouse company (see "Immediate next step" below). Nothing implemented yet. |
| 9–14 | Not started |

## Immediate next step (awaiting approval — do not implement without it)

Add **Stripe** as a second Greenhouse-backed source. This was proposed but the user had not yet approved it when this file was written.

- **What it is:** one new entry in the `ADAPTERS` array in `server/src/scripts/ingest.js`, calling the existing `createGreenhouseAdapter({ companyToken: "stripe", companyName: "Stripe" })` — the same factory GitLab already uses.
- **New dependencies: none.** Stays on Rung 1 of the Extraction Ladder.
- **Why Stripe:** verified live — 575 open roles (vs. Figma 161, Airbnb 189, Coinbase 173, Asana 126, Robinhood 130) — and a structurally different data pattern from GitLab (hybrid/office-concentrated real city locations, vs. GitLab's fully-remote "Remote, Country" pattern), which is a good low-risk test that the normalizer holds up on different real-world data.
- **What it proves:** the orchestrator running two adapters in one pass, correct per-company attribution, per-source failure isolation, combined summary reporting — the actual point of "multi-source," using nothing new.

If picking this up fresh: confirm with the user this is still what they want before touching `ingest.js`.

## Key architecture decisions already made

- **Auth:** JWT in an HttpOnly cookie (not localStorage). `requireAuth` / `requireAdmin` middleware in `server/src/middleware/auth.js`.
- **Database:** MongoDB Atlas, database name is `jobFinder` (capital F — this matters, was explicitly corrected once).
- **User preferences:** free-form tags for roles/locations/skills/companies; fixed enum for experience level (`internship`/`entry`/`mid`/`senior`, in `server/src/constants/experienceLevels.js`, shared by `User` and `Job` models). Onboarding is optional, anytime.
- **Saved jobs:** deliberately still in browser `localStorage`, not MongoDB. Revisit only when there's an actual reason to (cross-device sync, or notifications needing to know what's saved) — not before.
- **Job schema source-tracking fields** (added Phase 7): `source`, `sourceCompany`, `sourceJobId`, `sourceUrl`. Unique compound index on `(source, sourceCompany, sourceJobId)` — company identity is deliberately part of the dedup key so two different companies on the same ATS platform can never collide, even if that platform's IDs are assumed-globally-unique.
- **Ingestion architecture:** the "Extraction Ladder" — three interchangeable adapter tiers (API / HTML scraping / browser automation + AI), all producing the same `RawJob[]` shape so the orchestrator, normalizer, dedup index, and `Job` schema never change regardless of tier. Tier is chosen once per source, by hand, not as an automatic runtime fallback chain.
- **Ingestion pipeline (built, Phase 7):** `server/src/ingestion/sources/greenhouse.js` (adapter factory) → `server/src/ingestion/normalizer.js` (shared, source-agnostic cleanup) → `server/src/ingestion/orchestrator.js` (loops adapters, upserts, isolates failures) → `server/src/scripts/ingest.js` (manual trigger, same pattern as the old `seedJobs.js`).
- **Scheduling (planned, Phase 11, not built):** in-process `node-cron`. Explicitly **no Redis/BullMQ/Kafka** — deliberate choice to avoid infrastructure the project doesn't need yet. Note for later: once a browser-automation/AI source (Rung 3) exists, it'll need a much less frequent poll interval than API sources — a refinement for when Phase 11 actually arrives.
- **Matching (planned, Phase 10, not built):** deterministic rule-based, not ML. Computed on-demand for the UI; a separate pass right after ingestion for notifications.
- **Notifications (planned, Phase 12, not built):** email digest (batched, not one-per-job), dedup via a unique `(userId, jobId)` index on a future `Notification` collection.

## What's actually running right now

- MongoDB Atlas `jobFinder` database, `jobs` collection: **204 real GitLab job postings** from live Greenhouse ingestion, verified clean (no leftover HTML/entities, correct skills/experience-level/location, dedup confirmed by running ingestion twice).
- The old Phase 5/6 mock/seed jobs (Acme Corp, Northwind Systems, etc.) were **deliberately deleted** once real ingestion existed — `server/src/scripts/seedJobs.js` still exists but its placeholder purpose is now fulfilled; don't expect to see that data anymore.
- Client dev server (Vite, port 5173) and server dev server (`node --watch`, port 5000) need to be started manually each session — **they keep getting stopped between turns** (recurring environment issue, not a code problem). Restart with `npm run dev` in `client/` and `server/` respectively if a health check to `http://localhost:5000/api/health` fails or the UI won't load. Watch for orphaned Node processes holding port 5000 after a crash (`node --watch`'s child process sometimes survives its own crash on Windows) — check with `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` and kill stale ones before restarting.

## Real bugs found and fixed during Phase 7 (worth knowing about before touching this code again)

1. Mongoose's automatic `id` virtual is **not** included in `toJSON()` output by default — required `toJSON: { virtuals: true }` on the `Job` schema, or `job.id` comes back `undefined` on the frontend.
2. Greenhouse's `content` field is HTML-entity-encoded, and **inconsistently double-encoded** within the same document (e.g. `&nbsp;` once-encoded but `R&D` twice-encoded as `&amp;amp;D`). Fixed by decoding in a loop until the string stops changing, not a fixed number of passes.
3. Naive substring skill-matching produced false positives ("Go" matched inside "ne**go**tiations", "Express" inside gender "**express**ion"). Fixed with word-boundary regex — then found "Go" *still* legitimately matches inside "go-to-market" as a real standalone word, which isn't a bug, just an inherent collision risk for short common-English-word skill names. Dropped "Go" from the known-skills list rather than add more heuristics.

## File map (ingestion-relevant, as of Phase 7)

```
server/src/
  constants/experienceLevels.js
  models/Job.js              — source/sourceCompany/sourceJobId/sourceUrl + unique index
  models/User.js
  ingestion/
    normalizer.js             — shared, source-agnostic
    orchestrator.js            — loops adapters, upserts, isolates failures
    sources/
      greenhouse.js            — createGreenhouseAdapter({ companyToken, companyName })
  scripts/
    ingest.js                  — manual trigger; ADAPTERS array lives here
    seedJobs.js                — Phase 6 placeholder, superseded, data cleared
  routes/jobs.js                — GET /api/jobs, GET /api/jobs/:id
client/src/
  pages/Jobs.jsx, JobDetails.jsx  — fetch from the API, client-side filter/search
```
