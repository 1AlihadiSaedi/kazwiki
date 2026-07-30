/**
 * theme.js – Dark / Light theme manager for Emerald Wiki
 * Persists preference in localStorage.
 */

const THEME_KEY = 'emerald-wiki-theme';

/** Get the saved theme or default to 'light' */
export function getTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;

  // Respect system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/** Save theme and apply to DOM */
export function setTheme(theme) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

/** Apply saved theme on page load */
export function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
}