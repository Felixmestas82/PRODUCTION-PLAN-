import { useMemo, useState } from 'react';
import type { EngineeringItem, FabDocumentGateKey, GateStatus, ShopDrawingGateKey } from '../types';
import {
  ENGINEERING_STAGE_LABELS,
  FAB_DOCUMENT_LABELS,
  FAB_DOCUMENT_SEQUENCE,
  SHOP_DRAWING_LABELS,
  SHOP_DRAWING_SEQUENCE,
  engineeringStage,
  isEngineeringComplete,
} from '../lib/engineering';
import { GateBadge } from './GateBadge';
import { DeleteButton } from './DeleteButton';

interface Props {
  items: EngineeringItem[];
  updateShopDrawingGate: (id: string, gateKey: ShopDrawingGateKey, status: GateStatus) => void;
  updateFabDocumentGate: (id: string, gateKey: FabDocumentGateKey, status: GateStatus) => void;
  addItem: (overrides: Partial<EngineeringItem>) => void;
  deleteItem: (id: string) => void;
}

const BLANK_FORM = { project: '', pm: '', phase: '', tag: '', description: '' };

export function EngineeringTable({ items, updateShopDrawingGate, updateFabDocumentGate, addItem, deleteItem }: Props) {
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('ALL');
  const [releasedOnly, setReleasedOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);

  const submitAdd = () => {
    if (!form.project.trim()) return;
    addItem({
      project: form.project.trim(),
      pm: form.pm.trim() || null,
      phase: form.phase.trim() || null,
      tag: form.tag.trim() || null,
      description: form.description.trim() || null,
    });
    setForm(BLANK_FORM);
    setShowAddForm(false);
  };

  const projects = useMemo(() => Array.from(new Set(items.map((i) => i.project))).sort(), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (project !== 'ALL' && i.project !== project) return false;
      if (releasedOnly && !isEngineeringComplete(i)) return false;
      if (q) {
        const haystack = `${i.project} ${i.phase ?? ''} ${i.tag ?? ''} ${i.description ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, project, releasedOnly, search]);

  const releasedCount = useMemo(() => items.filter(isEngineeringComplete).length, [items]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-950">
        <input
          type="text"
          placeholder="Search project, phase, tag, description…"
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
        <label className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
          <input type="checkbox" checked={releasedOnly} onChange={(e) => setReleasedOnly(e.target.checked)} />
          Released to programming only
        </label>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded border border-stone-300 bg-white px-2.5 py-1 text-sm font-medium hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"
        >
          {showAddForm ? 'Cancel' : '+ Add Line Item'}
        </button>
        <div className="ml-auto text-sm text-stone-500 dark:text-stone-400">
          Showing {filtered.length} of {items.length} line items · {releasedCount} released
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
          <Field label="Tag">
            <input
              type="text"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-40 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <Field label="Description">
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
              className="w-56 rounded border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </Field>
          <button
            type="button"
            disabled={!form.project.trim()}
            onClick={submitAdd}
            className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Add line item
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[2000px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900 dark:text-stone-400">
            <tr>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">Project / Phase</th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">PM</th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800" colSpan={SHOP_DRAWING_SEQUENCE.length}>
                Shop Drawing Inputs
              </th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800" colSpan={FAB_DOCUMENT_SEQUENCE.length}>
                Fabrication Documents
              </th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800">Status</th>
              <th className="border-b border-stone-200 px-3 py-2 dark:border-stone-800" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const stage = engineeringStage(item);
              return (
                <tr key={item.id} className="border-b border-stone-100 align-top hover:bg-stone-50 dark:border-stone-900 dark:hover:bg-stone-900/50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-stone-900 dark:text-stone-100">{item.project}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {item.phase ? `Phase ${item.phase}` : ''} {item.tag ? `· ${item.tag}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-stone-600 dark:text-stone-300">{item.pm ?? '—'}</td>
                  {SHOP_DRAWING_SEQUENCE.map((key) => (
                    <td key={key} className="px-1 py-2">
                      <GateBadge
                        label={SHOP_DRAWING_LABELS[key]}
                        status={item.shopDrawingGates[key]}
                        onChange={(next) => updateShopDrawingGate(item.id, key, next)}
                      />
                    </td>
                  ))}
                  {FAB_DOCUMENT_SEQUENCE.map((key) => (
                    <td key={key} className="px-1 py-2">
                      <GateBadge
                        label={FAB_DOCUMENT_LABELS[key]}
                        status={item.fabDocumentGates[key]}
                        onChange={(next) => updateFabDocumentGate(item.id, key, next)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                        stage === 'DONE'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : stage === 'FAB_DOCUMENTS'
                            ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
                            : 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
                      }`}
                    >
                      {ENGINEERING_STAGE_LABELS[stage]}
                    </span>
                  </td>
                  <td className="px-1 py-2 text-center">
                    <DeleteButton onDelete={() => deleteItem(item.id)} label={`${item.project}${item.phase ? ' · ' + item.phase : ''}`} />
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
