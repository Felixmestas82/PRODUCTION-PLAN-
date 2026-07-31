# Shop Production Dashboard

A production tracking dashboard for the fabrication shop, built from the real
job data in `SHOP_PRODUCTION_PLAN_DRAFT.xlsm`. It covers the full pipeline
from sale to shipped part — Preconstruction → Engineering → Production Gates
→ Shop Floor Gantt — replacing manual spreadsheet gate-tracking with live
checklists and a department Gantt chart shared live across everyone on the
team.

## What it does

The dashboard has four tabs, one per stage of the shop's real workflow:

**Preconstruction tab** — 26 projects at the estimating/design stage, each
with its own gate checklist: **Estimate Rollout → Contract → Scope → Phase
Map → Schedule → Means & Methods → Critical Details → Value Strategy →
Handoff**. A project shows "Handed off" once every gate is Complete or N/A.

**Engineering tab** — 834 shop-drawing line items, each with two gate
groups pulled straight from the spreadsheet:
- *Shop Drawing Inputs*: In Eng Gantt, Phase Map/Schedule/Crit Details,
  Precon Handoff, Project Data Sheet, CAD Files, Draw Started, Submitted
  Shops, Approved Shops.
- *Fabrication Documents*: Tag Set/Fab Drawing, Field Verify, TS/FD
  Revisions, Fld Approval, Release to Prog, Programming, Done Done.

**Production tab** — 812 phase/tag line items from `PRODUCTION PLANNED`,
each with:

- The six pre-production gates, in order: **Eng Work → Pallet List →
  Ordered → Metal Onsite → Painted Fasteners → Check-In**. Click a gate
  badge to cycle it through Not Ready → In Progress → Complete → N/A.
- A computed **Ready for Queue** status — true only when every gate is
  Complete or N/A, exactly matching the logic already baked into the
  original spreadsheet (validated against all 812 existing rows with zero
  mismatches).
- Date inputs for **Fabrication, Paint, and Assembly** — the shop floor
  departments. Each is locked until the job is allowed to enter it:
  Fabrication unlocks once a job is Ready for Queue; Paint unlocks once
  Fabrication has a start date (or is marked N/A); Assembly unlocks the
  same way off Paint. A checkbox next to each date field marks that
  department N/A for parts that don't need it (e.g. no paint on a mill
  finish part) — checking it unlocks the next department without
  requiring a date.

**Gantt tab** — every department date you enter shows up as a bar on a
day-by-day timeline, grouped into Fabrication / Paint / Assembly lanes. When
two jobs land in the same department on overlapping days, they stack into
separate rows within that lane instead of overlapping, with a "capacity
conflict" flag — that's the shop-floor bottleneck view. Filter by project to
focus on one job.

Every gate badge across all three gated tabs works the same way: click to
cycle Not Ready → In Progress → Complete → N/A.

## Job number is the link key across stages

The spreadsheet's `PRECONSTRUCTION`, `ENGINEERING`, and `PRODUCTION PLANNED`
sheets are hand-maintained, and project *names* don't match cleanly between
them (e.g. `OAS AMMENITIES EAST` vs `OAS AMENITY EAST`). Job numbers are far
more reliable, so that's what the dashboard links on — every "+ Add" form
has a **Job No.** field, and matching job numbers drive two automatic gate
completions:

- **Preconstruction → Engineering**: once a project's every Preconstruction
  gate is Complete/N/A ("Handed off"), the **Precon Handoff** gate (one of
  the Shop Drawing Input gates) auto-completes on every Engineering line
  item with that job number — whether the item already existed or you add
  it afterward.
- **Engineering → Production**: once an Engineering line item's every gate
  (both groups) is Complete/N/A ("Released"), the **Eng Work** gate (the
  first Production gate) auto-completes on every Production line item with
  the same job number *and* matching phase/tag — again regardless of which
  side was created first.

This is reactive, not a one-time backfill — it only fires on gate changes
and row creation going forward, so it won't retroactively spawn synthetic
rows across the 812/834/26 rows imported from the original spreadsheet.
Both auto-completed gates stay regular gate badges — click one to override
it manually if needed; it just won't get overridden back automatically
unless the linked gate genuinely changes again.

## Data & persistence

Data lives in a shared Supabase (Postgres) project, not the browser — so
everyone who signs in sees the same live data, and edits sync to everyone
else automatically over Supabase Realtime. Each job/project/engineering
item is its own database row, so two people editing different jobs at the
same time never clobber each other; only a genuine edit to the *same* row
by two people at once resolves last-write-wins.

Access is gated behind a single shared login (Supabase Auth email/password)
— there's one shared account for the whole team, not individual per-person
logins. Row Level Security on every table requires that login, so the data
isn't reachable without it.

- **Export JSON** — downloads the current shared state as a backup file.
  This is read-only; there's deliberately no matching "Import" button,
  since bulk-importing would silently overwrite everyone's live data.

## One-time setup (Supabase + hosting)

This app needs a Supabase project and a static host (Vercel/Netlify) — it
can't run as a Claude Artifact page, since Artifacts can't hold state
shared between different people's browsers.

1. **Create a Supabase project** at supabase.com (free tier is enough for
   this scale). Note the Project URL and, from Settings → API, the anon
   key and the service_role key.
2. **Run `supabase/schema.sql`** in the Supabase SQL editor — creates the
   three tables, Row Level Security policies, and enables Realtime on them.
3. **Create the shared login**: Authentication → Users → Add user. Any
   email works; the password is what you share with your team.
4. **Copy `.env.example` to `.env`** and fill in `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` from step 1.
5. **Load the real spreadsheet data once**: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run migrate:seed`
   — pushes the 812/834/26 rows extracted from the original spreadsheet
   into the new tables. Uses the service_role key locally only; never put
   that key in `.env` or the deployed app.
6. **Deploy**: import this repo into Vercel (or Netlify), set the build
   command to `npm run build` and output directory to `dist`, and add
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as environment variables
   there too (same values as your `.env`). Every push to this branch
   redeploys automatically.

## Running it locally

```bash
npm install
npm run dev       # local dev server with hot reload — needs .env set up first
npm run build      # type-checks and produces a static production build in dist/
npm run preview    # serve the production build locally
```

## Project structure

- `src/types.ts` — data models for all four stages (`PreconstructionProject`,
  `EngineeringItem`, `Job`).
- `src/lib/gateStatus.ts` — shared gate-status helpers (`gateSatisfied`,
  `allGatesSatisfied`, `blockedGateKeys`) used by every stage.
- `src/lib/preconstruction.ts` / `src/lib/engineering.ts` / `src/lib/gates.ts`
  — gate sequences, labels, and readiness logic per stage.
- `src/lib/ganttLayout.ts` — the bin-packing algorithm that stacks
  overlapping department activities into separate Gantt rows.
- `src/lib/link.ts` / `src/lib/autoLink.ts` — job-number matching and the
  cross-stage gate auto-completion (Precon Handoff, Eng Work).
- `src/lib/supabase.ts` — the Supabase client, configured from
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- `src/lib/db.ts` — per-row read/write/delete against the three tables.
- `src/lib/realtime.ts` — Supabase Realtime subscriptions that merge other
  people's edits into local state as they happen.
- `src/lib/useAuth.ts` / `src/components/LoginScreen.tsx` — the shared-login
  auth gate.
- `src/lib/useAppData.ts` — the React state hook: optimistic local updates
  plus the Supabase read/write/subscribe wiring.
- `src/components/PreconstructionTable.tsx` / `EngineeringTable.tsx` /
  `JobsTable.tsx` — the editable gate tables per stage.
- `src/components/GanttView.tsx` — the department Gantt chart.
- `src/data/preconstruction_seed.json`, `engineering_seed.json`,
  `jobs_seed.json` — the real data extracted from the spreadsheet's
  `PRECONSTRUCTION`, `ENGINEERING`, and `PRODUCTION PLANNED` sheets, used
  only by `scripts/migrate-seed-to-supabase.mjs` (the app itself no longer
  reads these directly — data comes from Supabase at runtime).
- `supabase/schema.sql` — the database schema, RLS policies, and Realtime
  setup to run once in a new Supabase project.
- `scripts/migrate-seed-to-supabase.mjs` — one-time loader for the seed
  data into a fresh Supabase project.

## Extending this

Each stage's gate sequence is defined once (`PRECON_GATE_SEQUENCE`,
`SHOP_DRAWING_SEQUENCE` / `FAB_DOCUMENT_SEQUENCE`, `GATE_SEQUENCE` in
`src/lib/gates.ts`) — add or reorder entries there and the matching table
picks it up automatically. The cross-stage linking in `src/lib/autoLink.ts`
only wires two gates (Precon Handoff, Eng Work); if you want other gates to
sync the same way, or want a full merged timeline view per job number
instead of three separate tabs, that's the file to extend.
