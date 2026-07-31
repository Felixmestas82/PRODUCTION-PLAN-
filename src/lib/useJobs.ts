import { useCallback, useEffect, useRef, useState } from 'react';
import type { Job } from '../types';
import { loadJobs, resetToSeed, saveJobs } from './storage';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveJobs(jobs), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [jobs]);

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const updateGate = useCallback((id: string, gateKey: keyof Job['gates'], status: Job['gates'][keyof Job['gates']]) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, gates: { ...j.gates, [gateKey]: status } } : j)),
    );
  }, []);

  const updateDepartment = useCallback(
    (id: string, dept: keyof Job['departments'], patch: Partial<Job['departments'][keyof Job['departments']]>) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? { ...j, departments: { ...j.departments, [dept]: { ...j.departments[dept], ...patch } } }
            : j,
        ),
      );
    },
    [],
  );

  const replaceAll = useCallback((next: Job[]) => setJobs(next), []);

  const reset = useCallback(() => setJobs(resetToSeed()), []);

  return { jobs, updateJob, updateGate, updateDepartment, replaceAll, reset };
}
