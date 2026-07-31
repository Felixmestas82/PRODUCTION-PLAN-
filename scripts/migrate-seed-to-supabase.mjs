// One-time migration: loads the data extracted from the original
// spreadsheet (src/data/*_seed.json) into a freshly created Supabase
// project. Run this ONCE, right after running supabase/schema.sql.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as environment
// variables (the service_role key, never the anon key — this needs to
// bypass Row Level Security to do the bulk load, and must never be used
// anywhere in the deployed app itself).
//
// Usage:
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx node scripts/migrate-seed-to-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

function loadSeed(filename) {
  const filePath = path.join(__dirname, '..', 'src', 'data', filename);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

async function migrate(table, records) {
  const BATCH_SIZE = 200;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE).map((record) => ({ id: record.id, data: record }));
    const { error } = await supabase.from(table).upsert(batch);
    if (error) {
      console.error(`Failed inserting into ${table} at offset ${i}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`${table}: ${inserted}/${records.length}`);
  }
}

const preconstruction = loadSeed('preconstruction_seed.json');
const engineering = loadSeed('engineering_seed.json');
const jobs = loadSeed('jobs_seed.json');

console.log(`Migrating ${preconstruction.length} preconstruction projects, ${engineering.length} engineering items, ${jobs.length} production jobs...`);

await migrate('preconstruction_projects', preconstruction);
await migrate('engineering_items', engineering);
await migrate('production_jobs', jobs);

console.log('Done.');
