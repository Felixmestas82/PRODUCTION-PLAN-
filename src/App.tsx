import { useRef, useState } from 'react';
import { JobsTable } from './components/JobsTable';
import { GanttView } from './components/GanttView';
import { useJobs } from './lib/useJobs';
import { exportJobs, parseImportedJobs } from './lib/storage';

type View = 'jobs' | 'gantt';

function App() {
  const { jobs, updateGate, updateDepartment, replaceAll, reset } = useJobs();
  const [view, setView] = useState<View>('jobs');
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInput.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((text) => {
        const next = parseImportedJobs(text);
        replaceAll(next);
      })
      .catch((err) => alert(`Could not import file: ${(err as Error).message}`));
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset all jobs back to the original spreadsheet import? Local edits will be lost.')) {
      reset();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex items-center gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h1 className="text-base font-semibold">Shop Production Dashboard</h1>
        <nav className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          <TabButton active={view === 'jobs'} onClick={() => setView('jobs')}>
            Jobs &amp; Gates
          </TabButton>
          <TabButton active={view === 'gantt'} onClick={() => setView('gantt')}>
            Gantt
          </TabButton>
        </nav>
        <div className="ml-auto flex gap-2 text-sm">
          <button
            onClick={() => exportJobs(jobs)}
            className="rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Export JSON
          </button>
          <button
            onClick={handleImportClick}
            className="rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Import JSON
          </button>
          <input ref={fileInput} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          <button
            onClick={handleReset}
            className="rounded border border-gray-300 px-2.5 py-1 text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Reset to Import
          </button>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        {view === 'jobs' ? (
          <JobsTable jobs={jobs} updateGate={updateGate} updateDepartment={updateDepartment} />
        ) : (
          <GanttView jobs={jobs} />
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100'
          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

export default App;
