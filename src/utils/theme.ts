export type Theme = 'light' | 'dark';

const THEME_KEY = 'dagboek_theme';

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback in case localStorage is restricted
  }
  return 'light';
}

export function applyTheme(theme: Theme): void {
  try {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.warn('Kon thema niet opslaan:', err);
  }
}
