import type { GateStatus } from '../types';

export const GATE_STATUS_LABELS: Record<GateStatus, string> = {
  COMPLETE: 'Complete',
  IN_PROGRESS: 'In Progress',
  NOT_READY: 'Not Ready',
  N_A: 'N/A',
};

/** A gate satisfies a "ready to advance" requirement when complete or not applicable. */
export function gateSatisfied(status: GateStatus): boolean {
  return status === 'COMPLETE' || status === 'N_A';
}

export function allGatesSatisfied<K extends string>(
  gates: Record<K, GateStatus>,
  sequence: readonly K[],
): boolean {
  return sequence.every((key) => gateSatisfied(gates[key]));
}

/** Gates still blocking progress, in sequence order. */
export function blockedGateKeys<K extends string>(
  gates: Record<K, GateStatus>,
  sequence: readonly K[],
): K[] {
  return sequence.filter((key) => !gateSatisfied(gates[key]));
}
