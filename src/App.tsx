import { useState } from 'react';
import { JobsTable } from './components/JobsTable';
import { GanttView } from './components/GanttView';
import { PreconstructionTable } from './components/PreconstructionTable';
import { EngineeringTable } from './components/EngineeringTable';
import { LoginScreen } from './components/LoginScreen';
import { useAppData } from './lib/useAppData';
import { useAuth } from './lib/useAuth';
import { exportState } from './lib/storage';

type View = 'preconstruction' | 'engineering' | 'jobs' | 'gantt';

const TABS: { id: View; label: string }[] = [
  { id: 'preconstruction', label: 'Preconstruction' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'jobs', label: 'Production' },
  { id: 'gantt', label: 'Gantt' },
];

function App() {
  const { session, loading: authLoading, signIn, signOut } = useAuth();

  if (authLoading) {
    return <FullScreenMessage text="Loading…" />;
  }

  if (!session) {
    return <LoginScreen onSignIn={signIn} />;
  }

  return <Dashboard onSignOut={signOut} />;
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const {
    preconstruction,
    engineering,
    jobs,
    loading,
    error,
    clearError,
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
  } = useAppData();
  const [view, setView] = useState<View>('preconstruction');

  if (loading) {
    return <FullScreenMessage text="Loading shared data…" />;
  }

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
            onClick={onSignOut}
            className="rounded border border-stone-300 px-2.5 py-1 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900"
          >
            Sign out
          </button>
        </div>
      </header>
      {error && (
        <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-xs underline">
            Dismiss
          </button>
        </div>
      )}
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

function FullScreenMessage({ text }: { text: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-white text-sm text-stone-500 dark:bg-stone-950 dark:text-stone-400">
      {text}
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
