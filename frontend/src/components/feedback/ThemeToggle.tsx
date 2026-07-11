import { useEffect, useState } from 'react';

const STORAGE_KEY = 'atelier_theme';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

interface ThemeToggleProps {
  variant?: 'public' | 'internal';
}

export function ThemeToggle({ variant = 'public' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const className =
    variant === 'internal'
      ? 'min-h-9 rounded-[6px] border border-ivory/30 px-3 text-sm font-semibold text-ivory hover:bg-ivory/10'
      : 'min-h-9 rounded-[6px] border border-border bg-surface px-3 text-sm font-semibold text-anthracite hover:border-institution';

  return (
    <button type="button" onClick={toggle} className={className} aria-label="Changer le thème">
      {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    </button>
  );
}
