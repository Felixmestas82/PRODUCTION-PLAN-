import { useMemo, useState } from 'react';
import type { GateStatus, PreconstructionGateKey, PreconstructionProject } from '../types';
import { PRECON_GATE_LABELS, PRECON_GATE_SEQUENCE, isHandedOff, preconBlockedGates } from '../lib/preconstruction';
import { GateBadge } from './GateBadge';

interface Props {
  projects: PreconstructionProject[];
  updateGate: (id: string, gateKey: PreconstructionGateKey, status: GateStatus) => void;
}

export function PreconstructionTable({ projects, updateGate }: Props) {
  const [search, setSearch] = useState('');
  const [handedOffOnly, setHandedOffOnly] = useState<'ALL' | 'HANDED_OFF' | 'IN_PROGRESS'>('ALL');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (handedOffOnly === 'HANDED_OFF' && !isHandedOff(p)) return false;
      if (handedOffOnly === 'IN_PROGRESS' && isHandedOff(p)) return false;
      if (q) {
        const haystack = `${p.project} ${p.contractor ?? ''} ${p.pm ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [projects, search, handedOffOnly]);

  const handedOffCount = useMemo(() => projects.filter(isHandedOff).length, [projects]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <input
          type="text"
          placeholder="Search project, contractor, PM…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={handedOffOnly}
          onChange={(e) => setHandedOffOnly(e.target.value as typeof handedOffOnly)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="ALL">All projects</option>
          <option value="HANDED_OFF">Handed off to Engineering</option>
          <option value="IN_PROGRESS">Still in Preconstruction</option>
        </select>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {projects.length} projects · {handedOffCount} handed off
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Project</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Contractor</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">PM</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800" colSpan={PRECON_GATE_SEQUENCE.length}>
                Preconstruction Gates
              </th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const blocked = preconBlockedGates(project);
              const handedOff = isHandedOff(project);
              return (
                <tr key={project.id} className="border-b border-gray-100 align-top hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-gray-900/50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{project.project}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {project.jobNumber ?? '—'} {project.contractStatus ? `· ${project.contractStatus}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{project.contractor ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{project.pm ?? '—'}</td>
                  {PRECON_GATE_SEQUENCE.map((key) => (
                    <td key={key} className="px-1 py-2">
                      <GateBadge
                        label={PRECON_GATE_LABELS[key]}
                        status={project.gates[key]}
                        onChange={(next) => updateGate(project.id, key, next)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    {handedOff ? (
                      <span className="inline-block whitespace-nowrap rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Handed off
                      </span>
                    ) : (
                      <>
                        <span className="inline-block whitespace-nowrap rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-400">
                          In Preconstruction
                        </span>
                        {blocked.length > 0 && (
                          <div className="mt-1 text-[11px] text-gray-400">
                            Waiting on: {blocked.map((k) => PRECON_GATE_LABELS[k]).join(', ')}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">No projects match the current filters.</div>
        )}
      </div>
    </div>
  );
}
