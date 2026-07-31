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

interface Props {
  items: EngineeringItem[];
  updateShopDrawingGate: (id: string, gateKey: ShopDrawingGateKey, status: GateStatus) => void;
  updateFabDocumentGate: (id: string, gateKey: FabDocumentGateKey, status: GateStatus) => void;
}

export function EngineeringTable({ items, updateShopDrawingGate, updateFabDocumentGate }: Props) {
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('ALL');
  const [releasedOnly, setReleasedOnly] = useState(false);

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
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <input
          type="text"
          placeholder="Search project, phase, tag, description…"
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
        <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={releasedOnly} onChange={(e) => setReleasedOnly(e.target.checked)} />
          Released to programming only
        </label>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {items.length} line items · {releasedCount} released
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[2000px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Project / Phase</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">PM</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800" colSpan={SHOP_DRAWING_SEQUENCE.length}>
                Shop Drawing Inputs
              </th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800" colSpan={FAB_DOCUMENT_SEQUENCE.length}>
                Fabrication Documents
              </th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const stage = engineeringStage(item);
              return (
                <tr key={item.id} className="border-b border-gray-100 align-top hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-gray-900/50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.project}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.phase ? `Phase ${item.phase}` : ''} {item.tag ? `· ${item.tag}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item.pm ?? '—'}</td>
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
