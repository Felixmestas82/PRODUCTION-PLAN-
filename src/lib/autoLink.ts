import type { AppState } from './useAppData';
import type { EngineeringItem, Job, PreconstructionProject } from '../types';
import { isHandedOff } from './preconstruction';
import { isEngineeringComplete } from './engineering';
import { sameJobNo, samePhaseTag } from './link';

/**
 * Cross-stage gate linking, keyed by job number: Preconstruction handoff
 * closes the "Precon Handoff" gate on matching Engineering line items, and
 * Engineering completion closes the "Eng Work" gate on matching Production
 * line items. Runs both on gate changes (sync*) and on row creation
 * (precheck*) so linking works no matter which side happens first.
 *
 * sync* functions return the changed records too, not just the new state,
 * so callers can persist just those rows instead of the whole table.
 */

/** Precon handoff feeds the "Precon Handoff" shop-drawing gate on every
 *  Engineering line item that shares its job number. */
export function syncEngineeringFromPrecon(
  state: AppState,
  project: PreconstructionProject,
): { state: AppState; changed: EngineeringItem[] } {
  if (!isHandedOff(project)) return { state, changed: [] };
  const jobNo = project.jobNumber;
  if (jobNo == null || String(jobNo).trim() === '') return { state, changed: [] };

  const changed: EngineeringItem[] = [];
  const engineering = state.engineering.map((e) => {
    if (sameJobNo(e.jobNo, jobNo) && e.shopDrawingGates.preconHandoff !== 'COMPLETE') {
      const updated = { ...e, shopDrawingGates: { ...e.shopDrawingGates, preconHandoff: 'COMPLETE' as const } };
      changed.push(updated);
      return updated;
    }
    return e;
  });
  return changed.length > 0 ? { state: { ...state, engineering }, changed } : { state, changed: [] };
}

/** Should a brand-new Engineering line item start with Precon Handoff already
 *  complete, because its job number's precon project already handed off? */
export function precheckPreconHandoff(state: AppState, jobNo: EngineeringItem['jobNo']): boolean {
  if (jobNo == null || String(jobNo).trim() === '') return false;
  return state.preconstruction.some((p) => sameJobNo(p.jobNumber, jobNo) && isHandedOff(p));
}

/** Engineering completion feeds the "Eng Work" production gate on every
 *  Production line item that shares its job number, phase, and tag. */
export function syncProductionFromEngineering(
  state: AppState,
  item: EngineeringItem,
): { state: AppState; changed: Job[] } {
  if (!isEngineeringComplete(item)) return { state, changed: [] };

  const changed: Job[] = [];
  const jobs = state.jobs.map((j) => {
    if (sameJobNo(j.jobNo, item.jobNo) && samePhaseTag(j, item) && j.gates.engWork !== 'COMPLETE') {
      const updated = { ...j, gates: { ...j.gates, engWork: 'COMPLETE' as const } };
      changed.push(updated);
      return updated;
    }
    return j;
  });
  return changed.length > 0 ? { state: { ...state, jobs }, changed } : { state, changed: [] };
}

/** Should a brand-new Production line item start with Eng Work already
 *  complete, because a matching Engineering line item already finished? */
export function precheckEngWork(state: AppState, job: Pick<Job, 'jobNo' | 'phase' | 'tag'>): boolean {
  return state.engineering.some(
    (e) => sameJobNo(e.jobNo, job.jobNo) && samePhaseTag(job, e) && isEngineeringComplete(e),
  );
}
