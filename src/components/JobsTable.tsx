import { useMemo, useState } from 'react';
import type { DepartmentKey, Job } from '../types';
import {
  DEPARTMENT_LABELS,
  DEPARTMENT_SEQUENCE,
  GATE_LABELS,
  GATE_SEQUENCE,
  blockedGates,
  currentStage,
  departmentUnlocked,
  isReadyForQueue,
} from '../lib/gates';
import { GateBadge } from './GateBadge';
import { StageBadge } from './StageBadge';

interface Props {
  jobs: Job[];
  updateGate: (id: string, gateKey: keyof Job['gates'], status: Job['gates'][keyof Job['gates']]) => void;
  updateDepartment: (
    id: string,
    dept: DepartmentKey,
    patch: Partial<Job['departments'][DepartmentKey]>,
  ) => void;
}

export function JobsTable({ jobs, updateGate, updateDepartment }: Props) {
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('ALL');
  const [pm, setPm] = useState('ALL');
  const [readyOnly, setReadyOnly] = useState(false);

  const projects = useMemo(() => Array.from(new Set(jobs.map((j) => j.project))).sort(), [jobs]);
  const pms = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.pm).filter(Boolean))).sort() as string[],
    [jobs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (project !== 'ALL' && j.project !== project) return false;
      if (pm !== 'ALL' && j.pm !== pm) return false;
      if (readyOnly && !isReadyForQueue(j)) return false;
      if (q) {
        const haystack = `${j.project} ${j.phase ?? ''} ${j.tag ?? ''} ${j.scope ?? ''} ${j.material ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, project, pm, readyOnly, search]);

  const readyCount = useMemo(() => jobs.filter(isReadyForQueue).length, [jobs]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <input
          type="text"
          placeholder="Search project, phase, tag, scope…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="ALL">All projects ({projects.length})</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={pm}
          onChange={(e) => setPm(e.target.value)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="ALL">All PMs</option>
          {pms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={readyOnly} onChange={(e) => setReadyOnly(e.target.checked)} />
          Ready for queue only
        </label>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {jobs.length} line items · {readyCount} ready for queue
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1400px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Project / Phase</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">PM</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Need By</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800" colSpan={GATE_SEQUENCE.length}>
                Pre-Production Gates
              </th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Stage</th>
              {DEPARTMENT_SEQUENCE.map((d) => (
                <th key={d} className="border-b border-gray-200 px-3 py-2 dark:border-gray-800" colSpan={2}>
                  {DEPARTMENT_LABELS[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => {
              const blocked = blockedGates(job);
              const stage = currentStage(job);
              return (
                <tr key={job.id} className="border-b border-gray-100 align-top hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-gray-900/50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{job.project}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {job.phase ? `Phase ${job.phase}` : ''} {job.tag ? `· ${job.tag}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{job.pm ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{job.needBy ?? '—'}</td>
                  {GATE_SEQUENCE.map((key) => (
                    <td key={key} className="px-1 py-2">
                      <GateBadge
                        label={GATE_LABELS[key]}
                        status={job.gates[key]}
                        onChange={(next) => updateGate(job.id, key, next)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <StageBadge stage={stage} />
                    {blocked.length > 0 && (
                      <div className="mt-1 text-[11px] text-gray-400">
                        Waiting on: {blocked.map((k) => GATE_LABELS[k]).join(', ')}
                      </div>
                    )}
                  </td>
                  {DEPARTMENT_SEQUENCE.map((dept) => {
                    const unlocked = departmentUnlocked(job, dept);
                    const activity = job.departments[dept];
                    return (
                      <td key={dept} className="px-1 py-2" colSpan={2}>
                        <div className="flex gap-1">
                          <input
                            type="date"
                            disabled={!unlocked}
                            value={activity.startDate ?? ''}
                            title={unlocked ? `${DEPARTMENT_LABELS[dept]} start date` : 'Locked until prior stage has a start date'}
                            onChange={(e) => updateDepartment(job.id, dept, { startDate: e.target.value || null })}
                            className="w-[130px] rounded border border-gray-300 bg-white px-1 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:disabled:bg-gray-800"
                          />
                          <input
                            type="number"
                            min={0}
                            disabled={!unlocked}
                            placeholder="days"
                            value={activity.durationDays ?? ''}
                            onChange={(e) =>
                              updateDepartment(job.id, dept, {
                                durationDays: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-14 rounded border border-gray-300 bg-white px-1 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:disabled:bg-gray-800"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">No line items match the current filters.</div>
        )}
      </div>
    </div>
  );
}
