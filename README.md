# Shop Production Dashboard

A production tracking dashboard for the fabrication shop, built from the real
job data in `SHOP_PRODUCTION_PLAN_DRAFT.xlsm` (the `PRODUCTION PLANNED`
sheet). It replaces manual spreadsheet gate-tracking with a live checklist
and a department Gantt chart.

## What it does

**Jobs & Gates tab** — every phase/tag line item from the shop's production
plan (812 of them, across 30 projects), each with:

- The six pre-production gates from the spreadsheet, in order: **Eng Work →
  Pallet List → Ordered → Metal Onsite → Painted Fasteners → Check-In**.
  Click a gate badge to cycle it through Not Ready → In Progress → Complete →
  N/A.
- A computed **Ready for Queue** status — true only when every gate is
  Complete or N/A, exactly matching the logic already baked into the
  original spreadsheet (validated against all 812 existing rows with zero
  mismatches).
- Date inputs for **Fabrication, Paint, and Assembly** — the shop floor
  departments. Each is locked until the job is allowed to enter it:
  Fabrication unlocks once a job is Ready for Queue; Paint unlocks once
  Fabrication has a start date; Assembly unlocks once Paint has a start
  date. This is the enforcement of "the gates that have to happen to get
  something into production."

**Gantt tab** — every department date you enter shows up as a bar on a
day-by-day timeline, grouped into Fabrication / Paint / Assembly lanes. When
two jobs land in the same department on overlapping days, they stack into
separate rows within that lane instead of overlapping, with a "capacity
conflict" flag — that's the shop-floor bottleneck view. Filter by project to
focus on one job.

## Data & persistence

The dashboard loads your real job data from `src/data/jobs_seed.json`
(extracted directly from the spreadsheet's `PRODUCTION PLANNED` sheet). Any
edits you make (gate status, department dates) are saved to the browser's
local storage automatically, so they persist across reloads on the same
device/browser.

- **Export JSON** — download the current state of every job as a JSON file
  (for backup or moving to another browser).
- **Import JSON** — load a previously exported file, replacing current data.
- **Reset to Import** — wipe local edits and go back to the original
  spreadsheet data.

There is no backend — everything runs client-side. If you need multiple
people editing shared, live data, that would require adding a small server
and database, which isn't part of this build.

## Running it

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build      # type-checks and produces a static production build in dist/
npm run preview    # serve the production build locally
```

## Project structure

- `src/types.ts` — the `Job` data model (gates, departments, metadata).
- `src/lib/gates.ts` — gate sequence, readiness logic, department
  unlock/stage logic.
- `src/lib/ganttLayout.ts` — the bin-packing algorithm that stacks
  overlapping department activities into separate Gantt rows.
- `src/lib/storage.ts` / `src/lib/useJobs.ts` — local storage persistence
  and the React state hook.
- `src/components/JobsTable.tsx` — the editable gates/departments table.
- `src/components/GanttView.tsx` — the department Gantt chart.
- `src/data/jobs_seed.json` — the real job data extracted from the
  spreadsheet's `PRODUCTION PLANNED` sheet.

## Extending this

The gate sequence and department list are defined once in `src/lib/gates.ts`
(`GATE_SEQUENCE`, `DEPARTMENT_SEQUENCE`) — add or reorder entries there and
the table/Gantt pick it up automatically. The `PRECONSTRUCTION` and
`ENGINEERING` sheets in the original workbook have their own earlier gate
sequences (estimating/design, then shop drawings) that aren't modeled here
yet; the same pattern would extend to them if you want the dashboard to
cover the full pipeline from sale to shipped part.
