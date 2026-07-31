import type { GateStatus } from '../types';
import { GATE_STATUS_LABELS } from '../lib/gates';

const CYCLE: GateStatus[] = ['NOT_READY', 'IN_PROGRESS', 'COMPLETE', 'N_A'];

const STYLES: Record<GateStatus, string> = {
  COMPLETE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40',
  NOT_READY: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  N_A: 'bg-stone-500/10 text-stone-500 dark:text-stone-400 border-stone-500/25',
};

export function GateBadge({
  label,
  status,
  onChange,
}: {
  label: string;
  status: GateStatus;
  onChange: (next: GateStatus) => void;
}) {
  const cycle = () => {
    const idx = CYCLE.indexOf(status);
    onChange(CYCLE[(idx + 1) % CYCLE.length]);
  };

  return (
    <button
      type="button"
      title={`${label}: ${GATE_STATUS_LABELS[status]} (click to change)`}
      onClick={cycle}
      className={`w-full rounded border px-1.5 py-1 text-[10px] font-medium leading-tight transition-colors hover:brightness-95 ${STYLES[status]}`}
    >
      {label}
    </button>
  );
}
