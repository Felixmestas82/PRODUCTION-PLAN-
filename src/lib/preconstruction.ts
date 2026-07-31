import type { PreconstructionGateKey, PreconstructionProject } from '../types';
import { allGatesSatisfied, blockedGateKeys } from './gateStatus';

export const PRECON_GATE_SEQUENCE: PreconstructionGateKey[] = [
  'estimateRollout',
  'contract',
  'scope',
  'phaseMap',
  'schedule',
  'meansMethods',
  'criticalDetails',
  'valueStrategy',
  'handoff',
];

export const PRECON_GATE_LABELS: Record<PreconstructionGateKey, string> = {
  estimateRollout: 'Estimate Rollout',
  contract: 'Contract',
  scope: 'Scope',
  phaseMap: 'Phase Map',
  schedule: 'Schedule',
  meansMethods: 'Means & Methods',
  criticalDetails: 'Critical Details',
  valueStrategy: 'Value Strategy',
  handoff: 'Handoff',
};

/** A project is handed off to Engineering once every preconstruction gate clears. */
export function isHandedOff(project: PreconstructionProject): boolean {
  return allGatesSatisfied(project.gates, PRECON_GATE_SEQUENCE);
}

export function preconBlockedGates(project: PreconstructionProject): PreconstructionGateKey[] {
  return blockedGateKeys(project.gates, PRECON_GATE_SEQUENCE);
}
