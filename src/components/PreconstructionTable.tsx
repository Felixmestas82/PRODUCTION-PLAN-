import { useMemo, useState } from 'react';
import type { GateStatus, PreconstructionGateKey, PreconstructionProject } from '../types';
import { PRECON_GATE_LABELS, PRECON_GATE_SEQUENCE, isHandedOff, preconBlockedGates } from '../lib/preconstruction';
import { GateBadge } from './GateBadge';
import { DeleteButton } from './DeleteButton';

interface Props {
  projects: PreconstructionProject[];
  updateGate: (id: string, gateKey: PreconstructionGateKey, status: GateStatus) => void;
  addProject: (overrides: Partial<PreconstructionProject>) => void;
  deleteProject: (id: string) => void;
}

const BLANK_FORM = { project: '', contractor: '', pm: '', jobNumber: '' };

export function PreconstructionTable({ projects, updateGate, addProject, deleteProject }: Props) {
  const [search, setSearch] = useState('');
  const [handedOffOnly, setHandedOffOnly] = useState<'ALL' | 'HANDED_OFF' | 'IN_PROGRESS'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);

  const submitAdd = () => {
    if (!form.project.trim()) return;
    addProject({
      project: form.project.trim(),
      contractor: form.contractor.trim() || null,
      pm: form.pm.trim() || null,
      jobNumber: form.jobNumber.trim() || null,
    });
    setForm(BLANK_FORM);
    setShowAddForm(false);
  };

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
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded border border-gray-300 bg-white px-2.5 py-1 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          {showAddForm ? 'Cancel' : '+ Add Project'}
        </button>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {projects.length} projects · {handedOffCount} handed off
        </div>
      </div>

      {showAddForm && (
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <Field label="Project *">
            <input
              autoFocus
              type="text"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-48 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </Field>
          <Field label="Contractor">
            <input
              type="text"
              value={form.contractor}
              onChange={(e) => setForm({ ...form, contractor: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-40 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </Field>
          <Field label="PM">
            <input
              type="text"
              value={form.pm}
              onChange={(e) => setForm({ ...form, pm: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </Field>
          <Field label="Job number">
            <input
              type="text"
              value={form.jobNumber}
              onChange={(e) => setForm({ ...form, jobNumber: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-28 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </Field>
          <button
            type="button"
            disabled={!form.project.trim()}
            onClick={submitAdd}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            Add project
          </button>
        </div>
      )}

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
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800" />
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
                  <td className="px-1 py-2 text-center">
                    <DeleteButton onDelete={() => deleteProject(project.id)} label={project.project} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
      {label}
      {children}
    </label>
  );
}
