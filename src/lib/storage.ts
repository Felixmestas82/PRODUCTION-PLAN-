import type { EngineeringItem, Job, PreconstructionProject } from '../types';
import jobsSeed from '../data/jobs_seed.json';
import preconstructionSeed from '../data/preconstruction_seed.json';
import engineeringSeed from '../data/engineering_seed.json';

export interface AppState {
  preconstruction: PreconstructionProject[];
  engineering: EngineeringItem[];
  jobs: Job[];
}

const STORAGE_KEY = 'shop-production-dashboard/state/v2';
const LEGACY_JOBS_KEY = 'shop-production-dashboard/jobs/v1';

function seedState(): AppState {
  return {
    preconstruction: preconstructionSeed as PreconstructionProject[],
    engineering: engineeringSeed as EngineeringItem[],
    jobs: jobsSeed as Job[],
  };
}

function isAppState(v: unknown): v is AppState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return Array.isArray(s.jobs) && Array.isArray(s.preconstruction) && Array.isArray(s.engineering);
}

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isAppState(parsed)) return parsed;
    } catch {
      // fall through to seed data
    }
  }

  // Migrate edits made before Preconstruction/Engineering tabs existed.
  const legacyRaw = localStorage.getItem(LEGACY_JOBS_KEY);
  if (legacyRaw) {
    try {
      const legacyJobs = JSON.parse(legacyRaw);
      if (Array.isArray(legacyJobs) && legacyJobs.length > 0) {
        return { ...seedState(), jobs: legacyJobs as Job[] };
      }
    } catch {
      // fall through to seed data
    }
  }

  return seedState();
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetToSeed(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_JOBS_KEY);
  return seedState();
}

export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `production-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedState(text: string): AppState {
  const parsed = JSON.parse(text);
  if (!isAppState(parsed)) {
    throw new Error('Expected a JSON object with preconstruction, engineering, and jobs arrays');
  }
  return parsed;
}
