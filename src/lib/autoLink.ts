import type { AppState } from './storage';
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
 */

/** Precon handoff feeds the "Precon Handoff" shop-drawing gate on every
 *  Engineering line item that shares its job number. */
export function syncEngineeringFromPrecon(state: AppState, project: PreconstructionProject): AppState {
  if (!isHandedOff(project)) return state;
  const jobNo = project.jobNumber;
  if (jobNo == null || String(jobNo).trim() === '') return state;

  let changed = false;
  const engineering = state.engineering.map((e) => {
    if (sameJobNo(e.jobNo, jobNo) && e.shopDrawingGates.preconHandoff !== 'COMPLETE') {
      changed = true;
      return { ...e, shopDrawingGates: { ...e.shopDrawingGates, preconHandoff: 'COMPLETE' as const } };
    }
    return e;
  });
  return changed ? { ...state, engineering } : state;
}

/** Should a brand-new Engineering line item start with Precon Handoff already
 *  complete, because its job number's precon project already handed off? */
export function precheckPreconHandoff(state: AppState, jobNo: EngineeringItem['jobNo']): boolean {
  if (jobNo == null || String(jobNo).trim() === '') return false;
  return state.preconstruction.some((p) => sameJobNo(p.jobNumber, jobNo) && isHandedOff(p));
}

/** Engineering completion feeds the "Eng Work" production gate on every
 *  Production line item that shares its job number, phase, and tag. */
export function syncProductionFromEngineering(state: AppState, item: EngineeringItem): AppState {
  if (!isEngineeringComplete(item)) return state;

  let changed = false;
  const jobs = state.jobs.map((j) => {
    if (sameJobNo(j.jobNo, item.jobNo) && samePhaseTag(j, item) && j.gates.engWork !== 'COMPLETE') {
      changed = true;
      return { ...j, gates: { ...j.gates, engWork: 'COMPLETE' as const } };
    }
    return j;
  });
  return changed ? { ...state, jobs } : state;
}

/** Should a brand-new Production line item start with Eng Work already
 *  complete, because a matching Engineering line item already finished? */
export function precheckEngWork(state: AppState, job: Pick<Job, 'jobNo' | 'phase' | 'tag'>): boolean {
  return state.engineering.some(
    (e) => sameJobNo(e.jobNo, job.jobNo) && samePhaseTag(job, e) && isEngineeringComplete(e),
  );
}
