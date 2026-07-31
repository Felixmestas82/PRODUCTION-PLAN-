import type { Job } from '../types';
import seedData from '../data/jobs_seed.json';

const STORAGE_KEY = 'shop-production-dashboard/jobs/v1';

export function loadJobs(): Job[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData as Job[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Job[];
  } catch {
    // fall through to seed data
  }
  return seedData as Job[];
}

export function saveJobs(jobs: Job[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function resetToSeed(): Job[] {
  localStorage.removeItem(STORAGE_KEY);
  return seedData as Job[];
}

export function exportJobs(jobs: Job[]): void {
  const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `production-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedJobs(text: string): Job[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of jobs');
  return parsed as Job[];
}
