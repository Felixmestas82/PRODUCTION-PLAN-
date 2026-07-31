import { supabase } from './supabase';
import { TABLES } from './db';
import type { EngineeringItem, Job, PreconstructionProject } from '../types';

export type ChangeEvent<T> = { type: 'upsert'; id: string; record: T } | { type: 'delete'; id: string };
type ChangeHandler<T> = (event: ChangeEvent<T>) => void;

function subscribeTable<T>(table: string, onChange: ChangeHandler<T>): () => void {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload: { eventType: string; new: unknown; old: unknown }) => {
        if (payload.eventType === 'DELETE') {
          onChange({ type: 'delete', id: (payload.old as { id: string }).id });
        } else {
          const row = payload.new as { id: string; data: T };
          onChange({ type: 'upsert', id: row.id, record: row.data });
        }
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export const subscribePreconstruction = (onChange: ChangeHandler<PreconstructionProject>) =>
  subscribeTable(TABLES.preconstruction, onChange);
export const subscribeEngineering = (onChange: ChangeHandler<EngineeringItem>) =>
  subscribeTable(TABLES.engineering, onChange);
export const subscribeJobs = (onChange: ChangeHandler<Job>) => subscribeTable(TABLES.jobs, onChange);
