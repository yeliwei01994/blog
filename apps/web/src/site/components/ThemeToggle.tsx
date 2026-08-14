import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function preferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme | null) ?? preferredTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="切换深浅色主题" title="切换主题">◐</button>;
}
