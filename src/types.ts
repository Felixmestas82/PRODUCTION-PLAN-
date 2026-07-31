export type GateStatus = 'COMPLETE' | 'IN_PROGRESS' | 'NOT_READY' | 'N_A';

export type ProductionGateKey =
  | 'engWork'
  | 'palletList'
  | 'ordered'
  | 'metalOnsite'
  | 'paintedFasteners'
  | 'checkIn';

export type ProductionGates = Record<ProductionGateKey, GateStatus>;

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
  gates: ProductionGates;
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

// --- Preconstruction stage: project-level gates before any phase/tag line
// items exist. One record per project. ---

export type PreconstructionGateKey =
  | 'estimateRollout'
  | 'contract'
  | 'scope'
  | 'phaseMap'
  | 'schedule'
  | 'meansMethods'
  | 'criticalDetails'
  | 'valueStrategy'
  | 'handoff';

export type PreconstructionGates = Record<PreconstructionGateKey, GateStatus>;

export interface PreconstructionProject {
  id: string;
  contractStatus: string | null;
  dateEntered: string | null;
  priority: number | string | null;
  projectStatusLegacy: string | null;
  project: string;
  jobNumber: number | string | null;
  contractor: string | null;
  contact: string | null;
  foreman: string | null;
  pm: string | null;
  contractValue: number | null;
  gates: PreconstructionGates;
  doneBy: string | null;
  shopDrawingsDue: string | null;
}

// --- Engineering stage: shop-drawing line items, one per phase/tag, split
// into the two gate groups from the spreadsheet: Shop Drawing Inputs (the
// drawing itself) and Fabrication Documents (turning it into a fab-ready
// package). ---

export type ShopDrawingGateKey =
  | 'inEngGantt'
  | 'phaseMapScheduleCritDetails'
  | 'preconHandoff'
  | 'projectDataSheet'
  | 'cadFiles'
  | 'drawStarted'
  | 'submittedShops'
  | 'approvedShops';

export type FabDocumentGateKey =
  | 'tagSetFabDrawing'
  | 'fieldVerify'
  | 'tsFdRevisions'
  | 'fldApproval'
  | 'releaseToProg'
  | 'programming'
  | 'doneDone';

export type ShopDrawingGates = Record<ShopDrawingGateKey, GateStatus>;
export type FabDocumentGates = Record<FabDocumentGateKey, GateStatus>;

export interface EngineeringItem {
  id: string;
  pm: string | null;
  project: string;
  jobNo: number | string | null;
  phase: string | null;
  material: string | null;
  description: string | null;
  tag: string | null;
  scope: string | null;
  partQty: number | null;
  fieldDate: string | null;
  drawDuration: string | null;
  shopDrawingGates: ShopDrawingGates;
  fabDocumentGates: FabDocumentGates;
}
