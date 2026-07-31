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
import { DeleteButton } from './DeleteButton';

interface Props {
  jobs: Job[];
  updateGate: (id: string, gateKey: keyof Job['gates'], status: Job['gates'][keyof Job['gates']]) => void;
  updateDepartment: (
    id: string,
    dept: DepartmentKey,
    patch: Partial<Job['departments'][DepartmentKey]>,
  ) => void;
  addJob: (overrides: Partial<Job>) => void;
  deleteJob: (id: string) => void;
}

const BLANK_FORM = { project: '', jobNo: '', pm: '', phase: '', tag: '', needBy: '' };

export function JobsTable({ jobs, updateGate, updateDepartment, addJob, deleteJob }: Props) {
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('ALL');
  const [pm, setPm] = useState('ALL');
  const [readyOnly, setReadyOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);

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
        const haystack = `${j.project} ${j.jobNo ?? ''} ${j.phase ?? ''} ${j.tag ?? ''} ${j.scope ?? ''} ${j.material ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, project, pm, readyOnly, search]);

  const readyCount = useMemo(() => jobs.filter(isReadyForQueue).length, [jobs]);

  const submitAdd = () => {
    if (!form.project.trim()) return;
    addJob({
      project: form.project.trim(),
      jobNo: form.jobNo.trim() || null,
      pm: form.pm.trim() || null,
      phase: form.phase.trim() || null,
      tag: form.tag.trim() || null,
      needBy: form.needBy || null,
    });
    setForm(BLANK_FORM);
    setShowAddForm(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-950">
        <input
          type="text"
          placeholder="Search project, job no., phase, tag, scope…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900"
        />
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900"
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
          className="rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="ALL">All PMs</option>
          {pms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
          <input type="checkbox" checked={readyOnly} onChange={(e) => setReadyOnly(e.target.checked)} />
          Ready for queue only
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded border border-stone-300 bg-white px-2.5 py-1 text-sm font-medium hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"
        >
          {showAddForm ? 'Cancel' : '+ Add Job'}
        </button>
        <div className="ml-auto text-sm text-stone-500 dark:text-stone-400">
          Showing {filtered.length} of {jobs.length} line items · {readyCount} ready for queue
        </div>
      </div>

      {showAddForm && (
        <div className="flex flex-wrap items-end gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
          <Field label="Project *">
            <input
              autoFocus
              type="text"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-48 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <Field label="Job No.">
            <input
              type="text"
              value={form.jobNo}
              onChange={(e) => setForm({ ...form, jobNo: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              title="Links this line item to the same job number in Preconstruction and Engineering"
              className="w-24 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <Field label="PM">
            <input
              type="text"
              value={form.pm}
              onChange={(e) => setForm({ ...form, pm: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-20 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <Field label="Phase">
            <input
              type="text"
              value={form.phase}
              onChange={(e) => setForm({ ...form, phase: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-24 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <Field label="Tag / description">
            <input
              type="text"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-56 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <Field label="Need by">
            <input
              type="date"
              value={form.needBy}
              onChange={(e) => setForm({ ...form, needBy: e.target.value })}
              className="rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <button
            type="button"
            disabled={!form.project.trim()}
            onClick={submitAdd}
            className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Add job
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1560px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900 dark:text-stone-400">
            <tr>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">Project / Phase</th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">PM</th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">Need By</th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800" colSpan={GATE_SEQUENCE.length}>
                Pre-Production Gates
              </th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">Stage</th>
              {DEPARTMENT_SEQUENCE.map((d) => (
                <th key={d} className="border-b border-stone-200 px-3 py-2 dark:border-stone-800" colSpan={2}>
                  {DEPARTMENT_LABELS[d]}
                </th>
              ))}
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => {
              const blocked = blockedGates(job);
              const stage = currentStage(job);
              return (
                <tr key={job.id} className="border-b border-stone-100 align-top hover:bg-stone-50 dark:border-stone-900 dark:hover:bg-stone-900/50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-stone-900 dark:text-stone-100">{job.project}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {job.jobNo ?? '—'} {job.phase ? `· Phase ${job.phase}` : ''} {job.tag ? `· ${job.tag}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-stone-600 dark:text-stone-300">{job.pm ?? '—'}</td>
                  <td className="px-3 py-2 text-stone-600 dark:text-stone-300">{job.needBy ?? '—'}</td>
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
                      <div className="mt-1 text-[11px] text-stone-400">
                        Waiting on: {blocked.map((k) => GATE_LABELS[k]).join(', ')}
                      </div>
                    )}
                  </td>
                  {DEPARTMENT_SEQUENCE.map((dept) => {
                    const unlocked = departmentUnlocked(job, dept);
                    const activity = job.departments[dept];
                    const skipped = Boolean(activity.skipped);
                    return (
                      <td key={dept} className="px-1 py-2" colSpan={2}>
                        {skipped ? (
                          <div className="flex items-center gap-1.5">
                            <span className="rounded border border-stone-500/25 bg-stone-500/10 px-1.5 py-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                              N/A
                            </span>
                            <button
                              type="button"
                              onClick={() => updateDepartment(job.id, dept, { skipped: false })}
                              className="text-[11px] text-brand-600 hover:underline dark:text-brand-500"
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              disabled={!unlocked}
                              value={activity.startDate ?? ''}
                              title={unlocked ? `${DEPARTMENT_LABELS[dept]} start date` : 'Locked until prior stage has a start date'}
                              onChange={(e) => updateDepartment(job.id, dept, { startDate: e.target.value || null })}
                              className="w-[130px] rounded border border-stone-300 bg-white px-1 py-1 text-xs disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:disabled:bg-stone-800"
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
                              className="w-14 rounded border border-stone-300 bg-white px-1 py-1 text-xs disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:disabled:bg-stone-800"
                            />
                            <input
                              type="checkbox"
                              disabled={!unlocked}
                              checked={false}
                              title={`This part doesn't need ${DEPARTMENT_LABELS[dept]} — skip it`}
                              onChange={() => updateDepartment(job.id, dept, { skipped: true, startDate: null, durationDays: null })}
                              className="shrink-0 disabled:cursor-not-allowed"
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-1 py-2 text-center">
                    <DeleteButton onDelete={() => deleteJob(job.id)} label={`${job.project}${job.phase ? ' · ' + job.phase : ''}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-stone-400">No line items match the current filters.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-stone-500 dark:text-stone-400">
      {label}
      {children}
    </label>
  );
}
