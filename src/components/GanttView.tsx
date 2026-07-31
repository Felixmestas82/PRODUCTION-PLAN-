import { useMemo, useState } from 'react';
import type { Job } from '../types';
import { DEPARTMENT_LABELS, DEPARTMENT_SEQUENCE, addDays, departmentEndDate } from '../lib/gates';
import { daysBetween, packBars, type GanttBar } from '../lib/ganttLayout';

const DAY_WIDTH = 28;
const ROW_HEIGHT = 30;

const DEPT_COLOR: Record<string, string> = {
  fabrication: 'bg-indigo-500',
  paint: 'bg-fuchsia-500',
  assembly: 'bg-orange-500',
};

export function GanttView({ jobs }: { jobs: Job[] }) {
  const [project, setProject] = useState('ALL');

  const projects = useMemo(() => Array.from(new Set(jobs.map((j) => j.project))).sort(), [jobs]);

  const scoped = useMemo(
    () => (project === 'ALL' ? jobs : jobs.filter((j) => j.project === project)),
    [jobs, project],
  );

  const barsByDept = useMemo(() => {
    const map: Record<string, GanttBar[]> = { fabrication: [], paint: [], assembly: [] };
    for (const job of scoped) {
      for (const dept of DEPARTMENT_SEQUENCE) {
        const activity = job.departments[dept];
        if (!activity.startDate) continue;
        const end = departmentEndDate(job, dept) ?? addDays(activity.startDate, 1);
        map[dept].push({
          id: `${job.id}-${dept}`,
          label: `${job.project}${job.phase ? ' · ' + job.phase : ''}`,
          start: activity.startDate,
          end: end === activity.startDate ? addDays(end, 1) : end,
          color: DEPT_COLOR[dept],
        });
      }
    }
    return map;
  }, [scoped]);

  const allBars = [...barsByDept.fabrication, ...barsByDept.paint, ...barsByDept.assembly];

  if (allBars.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <ProjectFilter project={project} setProject={setProject} projects={projects} />
        <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-gray-400">
          <div>
            No department dates scheduled yet{project !== 'ALL' ? ` for ${project}` : ''}.
            <br />
            Go to the Jobs table and set a start date under Fabrication, Paint, or Assembly for a
            job that&rsquo;s ready for the queue — it will appear here.
          </div>
        </div>
      </div>
    );
  }

  const timelineStart = allBars.reduce((min, b) => (b.start < min ? b.start : min), allBars[0].start);
  const timelineEndRaw = allBars.reduce((max, b) => (b.end > max ? b.end : max), allBars[0].end);
  const start = addDays(timelineStart, -2);
  const end = addDays(timelineEndRaw, 3);
  const totalDays = Math.max(daysBetween(start, end), 1);

  const dayTicks = Array.from({ length: totalDays + 1 }, (_, i) => addDays(start, i));
  const todayIso = new Date().toISOString().slice(0, 10);

  const LABEL_WIDTH = 160;

  return (
    <div className="flex h-full flex-col">
      <ProjectFilter project={project} setProject={setProject} projects={projects} />
      <div className="flex-1 overflow-auto">
        <div style={{ width: totalDays * DAY_WIDTH + LABEL_WIDTH }}>
          <div className="sticky top-0 z-20 flex bg-white dark:bg-gray-950" style={{ marginLeft: LABEL_WIDTH }}>
            {dayTicks.map((d, i) =>
              i % 7 === 0 ? (
                <div
                  key={d}
                  style={{ width: DAY_WIDTH * 7 }}
                  className="shrink-0 border-r border-b border-gray-200 px-1 py-1 text-[10px] text-gray-400 dark:border-gray-800"
                >
                  {d}
                </div>
              ) : null,
            )}
          </div>

          {DEPARTMENT_SEQUENCE.map((dept) => {
            const { rows, rowCount } = packBars(barsByDept[dept]);
            if (rowCount === 0) return null;
            return (
              <div key={dept} className="border-b border-gray-200 dark:border-gray-800">
                <div className="sticky left-0 z-10 flex items-center bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  {DEPARTMENT_LABELS[dept]}
                  {rowCount > 1 && (
                    <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                      {rowCount} stacked lanes — capacity conflict
                    </span>
                  )}
                </div>
                <div className="relative" style={{ height: rowCount * ROW_HEIGHT + 8, marginLeft: LABEL_WIDTH }}>
                  <div className="pointer-events-none absolute inset-0 flex">
                    {dayTicks.map((d) => (
                      <div
                        key={d}
                        style={{ width: DAY_WIDTH }}
                        className={`shrink-0 border-r ${
                          d === todayIso
                            ? 'border-red-400/60 bg-red-500/5'
                            : 'border-gray-100 dark:border-gray-900'
                        }`}
                      />
                    ))}
                  </div>
                  {rows.flat().map((bar) => {
                    const left = daysBetween(start, bar.start) * DAY_WIDTH;
                    const width = Math.max(daysBetween(bar.start, bar.end) * DAY_WIDTH - 4, 8);
                    return (
                      <div
                        key={bar.id}
                        title={`${bar.label}: ${bar.start} → ${bar.end}`}
                        className={`absolute rounded px-1.5 text-[11px] leading-[22px] text-white shadow-sm ${bar.color}`}
                        style={{
                          left,
                          width,
                          top: bar.row * ROW_HEIGHT + 4,
                          height: 22,
                        }}
                      >
                        <span className="truncate">{bar.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectFilter({
  project,
  setProject,
  projects,
}: {
  project: string;
  setProject: (p: string) => void;
  projects: string[];
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
      <label className="text-sm text-gray-500 dark:text-gray-400">Project</label>
      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <option value="ALL">All projects</option>
        {projects.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
