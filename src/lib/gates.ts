import type { DepartmentKey, GateKey, GateStatus, Job } from '../types';

export const GATE_SEQUENCE: GateKey[] = [
  'engWork',
  'palletList',
  'ordered',
  'metalOnsite',
  'paintedFasteners',
  'checkIn',
];

export const GATE_LABELS: Record<GateKey, string> = {
  engWork: 'Eng Work',
  palletList: 'Pallet List',
  ordered: 'Ordered',
  metalOnsite: 'Metal Onsite',
  paintedFasteners: 'Painted Fasteners',
  checkIn: 'Check-In',
};

export const GATE_STATUS_LABELS: Record<GateStatus, string> = {
  COMPLETE: 'Complete',
  IN_PROGRESS: 'In Progress',
  NOT_READY: 'Not Ready',
  N_A: 'N/A',
};

export const DEPARTMENT_SEQUENCE: DepartmentKey[] = ['fabrication', 'paint', 'assembly'];

export const DEPARTMENT_LABELS: Record<DepartmentKey, string> = {
  fabrication: 'Fabrication',
  paint: 'Paint',
  assembly: 'Assembly',
};

/** A gate satisfies the "ready for queue" requirement when complete or not applicable. */
export function gateSatisfied(status: GateStatus): boolean {
  return status === 'COMPLETE' || status === 'N_A';
}

/** Every gate must be COMPLETE or N/A before a job can enter the production queue. */
export function isReadyForQueue(job: Job): boolean {
  return GATE_SEQUENCE.every((key) => gateSatisfied(job.gates[key]));
}

/** Gates still blocking a job from being ready for the queue, in sequence order. */
export function blockedGates(job: Job): GateKey[] {
  return GATE_SEQUENCE.filter((key) => !gateSatisfied(job.gates[key]));
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function departmentEndDate(job: Job, dept: DepartmentKey): string | null {
  const activity = job.departments[dept];
  if (!activity.startDate || !activity.durationDays) return activity.startDate;
  return addDays(activity.startDate, activity.durationDays);
}

/** Can a department date be entered for this job? Fabrication requires ready-for-queue;
 *  paint/assembly require the prior department to have a start date entered. */
export function departmentUnlocked(job: Job, dept: DepartmentKey): boolean {
  if (dept === 'fabrication') return isReadyForQueue(job);
  const priorIndex = DEPARTMENT_SEQUENCE.indexOf(dept) - 1;
  const prior = DEPARTMENT_SEQUENCE[priorIndex];
  return Boolean(job.departments[prior]?.startDate);
}

export type Stage = 'GATES' | 'QUEUED' | DepartmentKey | 'COMPLETE';

export function currentStage(job: Job): Stage {
  if (!isReadyForQueue(job)) return 'GATES';

  const today = new Date().toISOString().slice(0, 10);
  let stage: Stage = 'QUEUED';
  for (const dept of DEPARTMENT_SEQUENCE) {
    const activity = job.departments[dept];
    if (!activity.startDate) break;
    stage = dept;
    const end = departmentEndDate(job, dept);
    if (dept === 'assembly' && end && end <= today) {
      stage = 'COMPLETE';
    }
  }
  return stage;
}

export const STAGE_LABELS: Record<Stage, string> = {
  GATES: 'Pre-Production Gates',
  QUEUED: 'Ready for Queue',
  fabrication: 'Fabrication',
  paint: 'Paint',
  assembly: 'Assembly',
  COMPLETE: 'Complete',
};
