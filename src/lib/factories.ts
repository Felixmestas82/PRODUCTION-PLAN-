import type { EngineeringItem, Job, PreconstructionProject } from '../types';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: newId('job'),
    itemNumber: null,
    pm: null,
    project: '',
    jobNo: null,
    phase: null,
    material: null,
    scope: null,
    tag: null,
    partQty: null,
    submissionType: null,
    needBy: null,
    fieldDate: null,
    durationDays: null,
    gates: {
      engWork: 'NOT_READY',
      palletList: 'NOT_READY',
      ordered: 'NOT_READY',
      metalOnsite: 'NOT_READY',
      paintedFasteners: 'NOT_READY',
      checkIn: 'NOT_READY',
    },
    readyForQueueLegacy: false,
    actualStart: null,
    actualFinish: null,
    rushed: false,
    costCode: null,
    dateSubmitted: null,
    totalPiecesSubmitted: null,
    fabricator: null,
    shipTo: null,
    fabricationStatusLegacy: null,
    notes: null,
    departments: {
      fabrication: { startDate: null, durationDays: null, skipped: false },
      paint: { startDate: null, durationDays: null, skipped: false },
      assembly: { startDate: null, durationDays: null, skipped: false },
    },
    ...overrides,
  };
}

export function createPreconstructionProject(
  overrides: Partial<PreconstructionProject> = {},
): PreconstructionProject {
  return {
    id: newId('precon'),
    contractStatus: null,
    dateEntered: null,
    priority: null,
    projectStatusLegacy: null,
    project: '',
    jobNumber: null,
    contractor: null,
    contact: null,
    foreman: null,
    pm: null,
    contractValue: null,
    gates: {
      estimateRollout: 'NOT_READY',
      contract: 'NOT_READY',
      scope: 'NOT_READY',
      phaseMap: 'NOT_READY',
      schedule: 'NOT_READY',
      meansMethods: 'NOT_READY',
      criticalDetails: 'NOT_READY',
      valueStrategy: 'NOT_READY',
      handoff: 'NOT_READY',
    },
    doneBy: null,
    shopDrawingsDue: null,
    ...overrides,
  };
}

export function createEngineeringItem(overrides: Partial<EngineeringItem> = {}): EngineeringItem {
  return {
    id: newId('eng'),
    pm: null,
    project: '',
    jobNo: null,
    phase: null,
    material: null,
    description: null,
    tag: null,
    scope: null,
    partQty: null,
    fieldDate: null,
    drawDuration: null,
    shopDrawingGates: {
      inEngGantt: 'NOT_READY',
      phaseMapScheduleCritDetails: 'NOT_READY',
      preconHandoff: 'NOT_READY',
      projectDataSheet: 'NOT_READY',
      cadFiles: 'NOT_READY',
      drawStarted: 'NOT_READY',
      submittedShops: 'NOT_READY',
      approvedShops: 'NOT_READY',
    },
    fabDocumentGates: {
      tagSetFabDrawing: 'NOT_READY',
      fieldVerify: 'NOT_READY',
      tsFdRevisions: 'NOT_READY',
      fldApproval: 'NOT_READY',
      releaseToProg: 'NOT_READY',
      programming: 'NOT_READY',
      doneDone: 'NOT_READY',
    },
    ...overrides,
  };
}
