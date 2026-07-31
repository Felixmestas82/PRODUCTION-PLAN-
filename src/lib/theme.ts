/**
 * Bridges Tailwind's class-based dark mode to two sources of truth: the OS
 * `prefers-color-scheme` (default) and an explicit `data-theme` attribute on
 * <html> (set by embedding hosts like Claude Artifacts' theme toggle), which
 * must win in both directions when present.
 */
export function initThemeSync(): void {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const sync = () => {
    const explicit = root.dataset.theme;
    const isDark = explicit === 'dark' || (explicit !== 'light' && media.matches);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  };

  sync();
  media.addEventListener('change', sync);
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}
