export type GateStatus = 'COMPLETE' | 'IN_PROGRESS' | 'NOT_READY' | 'N_A';

export type GateKey =
  | 'engWork'
  | 'palletList'
  | 'ordered'
  | 'metalOnsite'
  | 'paintedFasteners'
  | 'checkIn';

export type Gates = Record<GateKey, GateStatus>;

export type DepartmentKey = 'fabrication' | 'paint' | 'assembly';

export interface DepartmentActivity {
  startDate: string | null; // ISO date
  durationDays: number | null;
}

export type Departments = Record<DepartmentKey, DepartmentActivity>;

export interface Job {
  id: string;
  itemNumber: number | null;
  pm: string | null;
  project: string;
  jobNo: number | string | null;
  phase: string | null;
  material: string | null;
  scope: string | null;
  tag: string | null;
  partQty: number | null;
  submissionType: string | null;
  needBy: string | null;
  fieldDate: string | null;
  durationDays: number | null;
  gates: Gates;
  readyForQueueLegacy: boolean;
  actualStart: string | null;
  actualFinish: string | null;
  rushed: boolean;
  costCode: string | number | null;
  dateSubmitted: string | null;
  totalPiecesSubmitted: number | null;
  fabricator: string | null;
  shipTo: string | null;
  fabricationStatusLegacy: string | null;
  notes: string | null;
  departments: Departments;
}
