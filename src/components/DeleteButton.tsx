export function DeleteButton({ onDelete, label }: { onDelete: () => void; label: string }) {
  return (
    <button
      type="button"
      title={`Delete ${label}`}
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (confirm(`Delete ${label}? This can't be undone.`)) onDelete();
      }}
      className="rounded px-1.5 py-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      ✕
    </button>
  );
}
