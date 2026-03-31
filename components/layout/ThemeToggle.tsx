'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Sun className="h-4 w-4 text-amber-500 dark:hidden" />
      <Moon className="h-4 w-4 text-slate-600 hidden dark:block" />
    </button>
  );
}