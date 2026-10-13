import { getCookie, setCookie } from './cookies'

// Colour themes. Each id has a block in src/themes.css (its colours) and a name in the
// i18n tables (t.settings.themes). The first one is the default.
export const THEMES = ['petrol', 'navy', 'plum', 'graphite', 'amber'] as const
export type Theme = (typeof THEMES)[number]

const COOKIE = 'tema'

export function savedTheme(): Theme {
  const saved = getCookie(COOKIE)
  return (THEMES as readonly string[]).includes(saved) ? (saved as Theme) : THEMES[0]
}

// Unlike the explanation language, a theme needs no reload: the colours are CSS
// variables keyed on <html data-theme>, so swapping the attribute recolours the page.
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function switchTheme(theme: Theme) {
  setCookie(COOKIE, theme)
  applyTheme(theme)
}
