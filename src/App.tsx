import { useRef, useState } from 'react';
import { JobsTable } from './components/JobsTable';
import { GanttView } from './components/GanttView';
import { PreconstructionTable } from './components/PreconstructionTable';
import { EngineeringTable } from './components/EngineeringTable';
import { useAppData } from './lib/useAppData';
import { exportState, parseImportedState } from './lib/storage';

type View = 'preconstruction' | 'engineering' | 'jobs' | 'gantt';

const TABS: { id: View; label: string }[] = [
  { id: 'preconstruction', label: 'Preconstruction' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'jobs', label: 'Production' },
  { id: 'gantt', label: 'Gantt' },
];

function App() {
  const {
    preconstruction,
    engineering,
    jobs,
    updatePreconGate,
    addPreconProject,
    deletePreconProject,
    updateShopDrawingGate,
    updateFabDocumentGate,
    addEngineeringItem,
    deleteEngineeringItem,
    updateGate,
    updateDepartment,
    addJob,
    deleteJob,
    replaceAll,
    reset,
  } = useAppData();
  const [view, setView] = useState<View>('preconstruction');
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInput.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((text) => {
        const next = parseImportedState(text);
        replaceAll(next);
      })
      .catch((err) => alert(`Could not import file: ${(err as Error).message}`));
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset everything back to the original spreadsheet import? Local edits will be lost.')) {
      reset();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="h-1 shrink-0 bg-gradient-to-r from-brand-gold via-brand-500 to-brand-700" />
      <header className="flex items-center gap-4 border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <h1 className="text-base font-semibold">Shop Production Dashboard</h1>
        <nav className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-900">
          {TABS.map((tab) => (
            <TabButton key={tab.id} active={view === tab.id} onClick={() => setView(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </nav>
        <div className="ml-auto flex gap-2 text-sm">
          <button
            onClick={() => exportState({ preconstruction, engineering, jobs })}
            className="rounded border border-stone-300 px-2.5 py-1 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900"
          >
            Export JSON
          </button>
          <button
            onClick={handleImportClick}
            className="rounded border border-stone-300 px-2.5 py-1 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900"
          >
            Import JSON
          </button>
          <input ref={fileInput} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          <button
            onClick={handleReset}
            className="rounded border border-stone-300 px-2.5 py-1 text-red-600 hover:bg-red-50 dark:border-stone-700 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Reset to Import
          </button>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        {view === 'preconstruction' && (
          <PreconstructionTable
            projects={preconstruction}
            updateGate={updatePreconGate}
            addProject={addPreconProject}
            deleteProject={deletePreconProject}
          />
        )}
        {view === 'engineering' && (
          <EngineeringTable
            items={engineering}
            updateShopDrawingGate={updateShopDrawingGate}
            updateFabDocumentGate={updateFabDocumentGate}
            addItem={addEngineeringItem}
            deleteItem={deleteEngineeringItem}
          />
        )}
        {view === 'jobs' && (
          <JobsTable
            jobs={jobs}
            updateGate={updateGate}
            updateDepartment={updateDepartment}
            addJob={addJob}
            deleteJob={deleteJob}
          />
        )}
        {view === 'gantt' && <GanttView jobs={jobs} />}
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
          ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500'
          : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
      }`}
    >
      {children}
    </button>
  );
}

export default App;
