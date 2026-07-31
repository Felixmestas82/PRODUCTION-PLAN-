import { useEffect, useRef, useState } from 'react';

/**
 * Click-to-arm, click-to-confirm delete button. Deliberately avoids
 * window.confirm() — when this app runs inside a sandboxed iframe (e.g.
 * published as a Claude Artifact), native dialogs are commonly blocked and
 * confirm() returns false without ever prompting, silently no-opping the
 * delete.
 */
export function DeleteButton({ onDelete, label }: { onDelete: () => void; label: string }) {
  const [armed, setArmed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  if (!armed) {
    return (
      <button
        type="button"
        title={`Delete ${label}`}
        aria-label={`Delete ${label}`}
        onClick={() => {
          setArmed(true);
          resetTimer.current = setTimeout(() => setArmed(false), 4000);
        }}
        className="rounded px-1.5 py-1 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        ✕
      </button>
    );
  }

  return (
    <button
      type="button"
      title={`Confirm delete ${label}`}
      aria-label={`Confirm delete ${label}`}
      onClick={() => {
        if (resetTimer.current) clearTimeout(resetTimer.current);
        onDelete();
      }}
      className="whitespace-nowrap rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
    >
      Confirm?
    </button>
  );
}
