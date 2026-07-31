import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DepartmentKey,
  EngineeringItem,
  FabDocumentGateKey,
  GateStatus,
  Job,
  PreconstructionGateKey,
  PreconstructionProject,
  ShopDrawingGateKey,
} from '../types';
import { precheckEngWork, precheckPreconHandoff, syncEngineeringFromPrecon, syncProductionFromEngineering } from './autoLink';
import { createEngineeringItem, createJob, createPreconstructionProject } from './factories';
import {
  deleteEngineeringItemRow,
  deleteJobRow,
  deletePreconProjectRow,
  fetchAllData,
  saveEngineeringItem,
  saveJob,
  savePreconProject,
} from './db';
import { subscribeEngineering, subscribeJobs, subscribePreconstruction } from './realtime';

export interface AppState {
  preconstruction: PreconstructionProject[];
  engineering: EngineeringItem[];
  jobs: Job[];
}

function upsertInList<T extends { id: string }>(list: T[], record: T): T[] {
  const index = list.findIndex((item) => item.id === record.id);
  if (index === -1) return [record, ...list];
  const next = [...list];
  next[index] = record;
  return next;
}

export function useAppData() {
  const [state, setState] = useState<AppState>({ preconstruction: [], engineering: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    fetchAllData()
      .then((data) => {
        if (!cancelled) {
          setState(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(`Could not load data: ${err.message}`);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubPrecon = subscribePreconstruction((event) => {
      setState((prev) => ({
        ...prev,
        preconstruction:
          event.type === 'delete'
            ? prev.preconstruction.filter((p) => p.id !== event.id)
            : upsertInList(prev.preconstruction, event.record),
      }));
    });
    const unsubEng = subscribeEngineering((event) => {
      setState((prev) => ({
        ...prev,
        engineering:
          event.type === 'delete' ? prev.engineering.filter((e) => e.id !== event.id) : upsertInList(prev.engineering, event.record),
      }));
    });
    const unsubJobs = subscribeJobs((event) => {
      setState((prev) => ({
        ...prev,
        jobs: event.type === 'delete' ? prev.jobs.filter((j) => j.id !== event.id) : upsertInList(prev.jobs, event.record),
      }));
    });
    return () => {
      unsubPrecon();
      unsubEng();
      unsubJobs();
    };
  }, []);

  const persist = useCallback((fn: () => Promise<void>) => {
    fn().catch((err: Error) => setError(`Could not save your last change: ${err.message}`));
  }, []);

  // Preconstruction
  const updatePreconGate = useCallback(
    (id: string, gateKey: PreconstructionGateKey, status: GateStatus) => {
      const prev = stateRef.current;
      const project = prev.preconstruction.find((p) => p.id === id);
      if (!project) return;
      const updatedProject = { ...project, gates: { ...project.gates, [gateKey]: status } };
      const preconstruction = prev.preconstruction.map((p) => (p.id === id ? updatedProject : p));
      const { state: next, changed } = syncEngineeringFromPrecon({ ...prev, preconstruction }, updatedProject);
      setState(next);
      persist(() => savePreconProject(updatedProject));
      changed.forEach((item) => persist(() => saveEngineeringItem(item)));
    },
    [persist],
  );

  const addPreconProject = useCallback(
    (overrides: Partial<PreconstructionProject>) => {
      const project = createPreconstructionProject(overrides);
      setState((prev) => ({ ...prev, preconstruction: [project, ...prev.preconstruction] }));
      persist(() => savePreconProject(project));
    },
    [persist],
  );

  const deletePreconProject = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, preconstruction: prev.preconstruction.filter((p) => p.id !== id) }));
      persist(() => deletePreconProjectRow(id));
    },
    [persist],
  );

  // Engineering
  const updateShopDrawingGate = useCallback(
    (id: string, gateKey: ShopDrawingGateKey, status: GateStatus) => {
      const prev = stateRef.current;
      const item = prev.engineering.find((i) => i.id === id);
      if (!item) return;
      const updatedItem = { ...item, shopDrawingGates: { ...item.shopDrawingGates, [gateKey]: status } };
      const engineering = prev.engineering.map((i) => (i.id === id ? updatedItem : i));
      const { state: next, changed } = syncProductionFromEngineering({ ...prev, engineering }, updatedItem);
      setState(next);
      persist(() => saveEngineeringItem(updatedItem));
      changed.forEach((job) => persist(() => saveJob(job)));
    },
    [persist],
  );

  const updateFabDocumentGate = useCallback(
    (id: string, gateKey: FabDocumentGateKey, status: GateStatus) => {
      const prev = stateRef.current;
      const item = prev.engineering.find((i) => i.id === id);
      if (!item) return;
      const updatedItem = { ...item, fabDocumentGates: { ...item.fabDocumentGates, [gateKey]: status } };
      const engineering = prev.engineering.map((i) => (i.id === id ? updatedItem : i));
      const { state: next, changed } = syncProductionFromEngineering({ ...prev, engineering }, updatedItem);
      setState(next);
      persist(() => saveEngineeringItem(updatedItem));
      changed.forEach((job) => persist(() => saveJob(job)));
    },
    [persist],
  );

  const addEngineeringItem = useCallback(
    (overrides: Partial<EngineeringItem>) => {
      const prev = stateRef.current;
      const item = createEngineeringItem(overrides);
      if (precheckPreconHandoff(prev, item.jobNo)) {
        item.shopDrawingGates.preconHandoff = 'COMPLETE';
      }
      setState((p) => ({ ...p, engineering: [item, ...p.engineering] }));
      persist(() => saveEngineeringItem(item));
    },
    [persist],
  );

  const deleteEngineeringItem = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, engineering: prev.engineering.filter((i) => i.id !== id) }));
      persist(() => deleteEngineeringItemRow(id));
    },
    [persist],
  );

  // Jobs (production planned + departments)
  const addJob = useCallback(
    (overrides: Partial<Job>) => {
      const prev = stateRef.current;
      const job = createJob(overrides);
      if (precheckEngWork(prev, job)) {
        job.gates.engWork = 'COMPLETE';
      }
      setState((p) => ({ ...p, jobs: [job, ...p.jobs] }));
      persist(() => saveJob(job));
    },
    [persist],
  );

  const deleteJob = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, jobs: prev.jobs.filter((j) => j.id !== id) }));
      persist(() => deleteJobRow(id));
    },
    [persist],
  );

  const updateGate = useCallback(
    (id: string, gateKey: keyof Job['gates'], status: Job['gates'][keyof Job['gates']]) => {
      const prev = stateRef.current;
      const job = prev.jobs.find((j) => j.id === id);
      if (!job) return;
      const updatedJob = { ...job, gates: { ...job.gates, [gateKey]: status } };
      setState((p) => ({ ...p, jobs: p.jobs.map((j) => (j.id === id ? updatedJob : j)) }));
      persist(() => saveJob(updatedJob));
    },
    [persist],
  );

  const updateDepartment = useCallback(
    (id: string, dept: DepartmentKey, patch: Partial<Job['departments'][DepartmentKey]>) => {
      const prev = stateRef.current;
      const job = prev.jobs.find((j) => j.id === id);
      if (!job) return;
      const updatedJob = { ...job, departments: { ...job.departments, [dept]: { ...job.departments[dept], ...patch } } };
      setState((p) => ({ ...p, jobs: p.jobs.map((j) => (j.id === id ? updatedJob : j)) }));
      persist(() => saveJob(updatedJob));
    },
    [persist],
  );

  return {
    preconstruction: state.preconstruction,
    engineering: state.engineering,
    jobs: state.jobs,
    loading,
    error,
    clearError: () => setError(null),
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
  };
}
