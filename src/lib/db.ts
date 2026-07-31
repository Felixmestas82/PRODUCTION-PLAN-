import { supabase } from './supabase';
import type { EngineeringItem, Job, PreconstructionProject } from '../types';

export const TABLES = {
  preconstruction: 'preconstruction_projects',
  engineering: 'engineering_items',
  jobs: 'production_jobs',
} as const;

interface Row<T> {
  id: string;
  data: T;
}

async function fetchAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('id, data');
  if (error) throw error;
  return (data as Row<T>[]).map((r) => r.data);
}

async function upsertRow<T extends { id: string }>(table: string, record: T): Promise<void> {
  const { error } = await supabase
    .from(table)
    .upsert({ id: record.id, data: record, updated_at: new Date().toISOString() });
  if (error) throw error;
}

async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function fetchAllData(): Promise<{
  preconstruction: PreconstructionProject[];
  engineering: EngineeringItem[];
  jobs: Job[];
}> {
  const [preconstruction, engineering, jobs] = await Promise.all([
    fetchAll<PreconstructionProject>(TABLES.preconstruction),
    fetchAll<EngineeringItem>(TABLES.engineering),
    fetchAll<Job>(TABLES.jobs),
  ]);
  return { preconstruction, engineering, jobs };
}

export const savePreconProject = (project: PreconstructionProject) => upsertRow(TABLES.preconstruction, project);
export const deletePreconProjectRow = (id: string) => deleteRow(TABLES.preconstruction, id);
export const saveEngineeringItem = (item: EngineeringItem) => upsertRow(TABLES.engineering, item);
export const deleteEngineeringItemRow = (id: string) => deleteRow(TABLES.engineering, id);
export const saveJob = (job: Job) => upsertRow(TABLES.jobs, job);
export const deleteJobRow = (id: string) => deleteRow(TABLES.jobs, id);
