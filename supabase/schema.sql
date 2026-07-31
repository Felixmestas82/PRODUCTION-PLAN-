-- Shop Production Dashboard — Supabase schema.
-- Run this once in the Supabase SQL editor (Database > SQL Editor > New query)
-- on a freshly created project, then run `npm run migrate:seed` locally to
-- load the data extracted from the original spreadsheet.
--
-- Each table is one row per record, storing the full record as jsonb in
-- `data` (matching the app's existing TypeScript types exactly) plus a
-- plain `id` column for fast lookup/delete. This means edits from
-- different people only ever touch their own row — no whole-table
-- overwrite races when 4-5 people edit different jobs at once.

create table if not exists preconstruction_projects (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists engineering_items (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists production_jobs (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: only signed-in users (the one shared team login) can
-- read or write. Nobody can access the data without that login.
alter table preconstruction_projects enable row level security;
alter table engineering_items enable row level security;
alter table production_jobs enable row level security;

create policy "authenticated read/write" on preconstruction_projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write" on engineering_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write" on production_jobs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Realtime: broadcast row changes so every open dashboard sees edits live.
alter publication supabase_realtime add table preconstruction_projects;
alter publication supabase_realtime add table engineering_items;
alter publication supabase_realtime add table production_jobs;
