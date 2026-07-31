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
import { createEngineeringItem, createJob, createPreconstructionProject } from './factories';
import { type AppState, loadState, resetToSeed, saveState } from './storage';

export function useAppData() {
  const [state, setState] = useState<AppState>(() => loadState());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // Preconstruction
  const updatePreconGate = useCallback((id: string, gateKey: PreconstructionGateKey, status: GateStatus) => {
    setState((prev) => ({
      ...prev,
      preconstruction: prev.preconstruction.map((p) =>
        p.id === id ? { ...p, gates: { ...p.gates, [gateKey]: status } } : p,
      ),
    }));
  }, []);

  const addPreconProject = useCallback((overrides: Partial<PreconstructionProject>) => {
    setState((prev) => ({
      ...prev,
      preconstruction: [createPreconstructionProject(overrides), ...prev.preconstruction],
    }));
  }, []);

  const deletePreconProject = useCallback((id: string) => {
    setState((prev) => ({ ...prev, preconstruction: prev.preconstruction.filter((p) => p.id !== id) }));
  }, []);

  // Engineering
  const updateShopDrawingGate = useCallback((id: string, gateKey: ShopDrawingGateKey, status: GateStatus) => {
    setState((prev) => ({
      ...prev,
      engineering: prev.engineering.map((i) =>
        i.id === id ? { ...i, shopDrawingGates: { ...i.shopDrawingGates, [gateKey]: status } } : i,
      ),
    }));
  }, []);

  const updateFabDocumentGate = useCallback((id: string, gateKey: FabDocumentGateKey, status: GateStatus) => {
    setState((prev) => ({
      ...prev,
      engineering: prev.engineering.map((i) =>
        i.id === id ? { ...i, fabDocumentGates: { ...i.fabDocumentGates, [gateKey]: status } } : i,
      ),
    }));
  }, []);

  const addEngineeringItem = useCallback((overrides: Partial<EngineeringItem>) => {
    setState((prev) => ({ ...prev, engineering: [createEngineeringItem(overrides), ...prev.engineering] }));
  }, []);

  const deleteEngineeringItem = useCallback((id: string) => {
    setState((prev) => ({ ...prev, engineering: prev.engineering.filter((i) => i.id !== id) }));
  }, []);

  // Jobs (production planned + departments)
  const addJob = useCallback((overrides: Partial<Job>) => {
    setState((prev) => ({ ...prev, jobs: [createJob(overrides), ...prev.jobs] }));
  }, []);

  const deleteJob = useCallback((id: string) => {
    setState((prev) => ({ ...prev, jobs: prev.jobs.filter((j) => j.id !== id) }));
  }, []);

  const updateGate = useCallback(
    (id: string, gateKey: keyof Job['gates'], status: Job['gates'][keyof Job['gates']]) => {
      setState((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => (j.id === id ? { ...j, gates: { ...j.gates, [gateKey]: status } } : j)),
      }));
    },
    [],
  );

  const updateDepartment = useCallback(
    (id: string, dept: DepartmentKey, patch: Partial<Job['departments'][DepartmentKey]>) => {
      setState((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === id
            ? { ...j, departments: { ...j.departments, [dept]: { ...j.departments[dept], ...patch } } }
            : j,
        ),
      }));
    },
    [],
  );

  const replaceAll = useCallback((next: AppState) => setState(next), []);
  const reset = useCallback(() => setState(resetToSeed()), []);

  return {
    preconstruction: state.preconstruction,
    engineering: state.engineering,
    jobs: state.jobs,
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
  };
}
