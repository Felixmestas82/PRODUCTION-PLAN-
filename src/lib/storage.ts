import type { AppState } from './useAppData';

/** Downloads the current shared state as a JSON file — a local backup, not
 *  a way to modify the shared database (that would require a bulk-import
 *  feature this app deliberately doesn't have, since it would let one
 *  person silently overwrite everyone else's live data). */
export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `production-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
