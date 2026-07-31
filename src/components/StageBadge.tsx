import type { Stage } from '../lib/gates';
import { STAGE_LABELS } from '../lib/gates';

const STYLES: Record<Stage, string> = {
  GATES: 'bg-red-500/10 text-red-700 dark:text-red-400',
  QUEUED: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  fabrication: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  paint: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400',
  assembly: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  COMPLETE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}
