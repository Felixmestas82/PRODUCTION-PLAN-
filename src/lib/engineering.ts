import type { EngineeringItem, FabDocumentGateKey, ShopDrawingGateKey } from '../types';
import { allGatesSatisfied, blockedGateKeys } from './gateStatus';

export const SHOP_DRAWING_SEQUENCE: ShopDrawingGateKey[] = [
  'inEngGantt',
  'phaseMapScheduleCritDetails',
  'preconHandoff',
  'projectDataSheet',
  'cadFiles',
  'drawStarted',
  'submittedShops',
  'approvedShops',
];

export const SHOP_DRAWING_LABELS: Record<ShopDrawingGateKey, string> = {
  inEngGantt: 'In Eng Gantt',
  phaseMapScheduleCritDetails: 'Phase Map / Schedule / Crit Details',
  preconHandoff: 'Precon Handoff',
  projectDataSheet: 'Project Data Sheet',
  cadFiles: 'CAD Files',
  drawStarted: 'Draw Started',
  submittedShops: 'Submitted Shops',
  approvedShops: 'Approved Shops',
};

export const FAB_DOCUMENT_SEQUENCE: FabDocumentGateKey[] = [
  'tagSetFabDrawing',
  'fieldVerify',
  'tsFdRevisions',
  'fldApproval',
  'releaseToProg',
  'programming',
  'doneDone',
];

export const FAB_DOCUMENT_LABELS: Record<FabDocumentGateKey, string> = {
  tagSetFabDrawing: 'Tag Set / Fab Drawing',
  fieldVerify: 'Field Verify',
  tsFdRevisions: 'TS/FD Revisions',
  fldApproval: 'Fld Approval',
  releaseToProg: 'Release to Prog',
  programming: 'Programming',
  doneDone: 'Done Done',
};

export function isShopDrawingComplete(item: EngineeringItem): boolean {
  return allGatesSatisfied(item.shopDrawingGates, SHOP_DRAWING_SEQUENCE);
}

export function isFabDocumentComplete(item: EngineeringItem): boolean {
  return allGatesSatisfied(item.fabDocumentGates, FAB_DOCUMENT_SEQUENCE);
}

/** An engineering item is fully released once both gate groups clear. */
export function isEngineeringComplete(item: EngineeringItem): boolean {
  return isShopDrawingComplete(item) && isFabDocumentComplete(item);
}

export function shopDrawingBlockedGates(item: EngineeringItem): ShopDrawingGateKey[] {
  return blockedGateKeys(item.shopDrawingGates, SHOP_DRAWING_SEQUENCE);
}

export function fabDocumentBlockedGates(item: EngineeringItem): FabDocumentGateKey[] {
  return blockedGateKeys(item.fabDocumentGates, FAB_DOCUMENT_SEQUENCE);
}

export type EngineeringStage = 'SHOP_DRAWING' | 'FAB_DOCUMENTS' | 'DONE';

export function engineeringStage(item: EngineeringItem): EngineeringStage {
  if (!isShopDrawingComplete(item)) return 'SHOP_DRAWING';
  if (!isFabDocumentComplete(item)) return 'FAB_DOCUMENTS';
  return 'DONE';
}

export const ENGINEERING_STAGE_LABELS: Record<EngineeringStage, string> = {
  SHOP_DRAWING: 'Shop Drawing',
  FAB_DOCUMENTS: 'Fabrication Documents',
  DONE: 'Released',
};
