import { useState } from 'react'
import { t } from '../i18n'
import { THEMES, savedTheme, switchTheme, type Theme } from '../lib/theme'

// The swatch steps a card shows: the light tint boxes use, the accent, the dark text.
const SWATCHES = ['bg-brand-100', 'bg-brand-500', 'bg-brand-700']

function Settings() {
  const [current, setCurrent] = useState<Theme>(savedTheme)

  const choose = (theme: Theme) => {
    switchTheme(theme)
    setCurrent(theme)
  }

  return (
    <section>
      <h1 className="text-3xl font-bold">{t.settings.title}</h1>

      <h2 className="mt-8 text-lg font-semibold">{t.settings.theme}</h2>
      <p className="mt-1 text-sm text-gray-500">{t.settings.themeNote}</p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((theme) => {
          const active = theme === current
          return (
            // data-theme on the card scopes the theme's colours to it, so every card
            // previews its own theme whatever the page is currently using.
            <li key={theme} data-theme={theme}>
              <button
                type="button"
                onClick={() => choose(theme)}
                aria-pressed={active}
                className={`flex w-full flex-col gap-3 rounded-lg border bg-white p-4 text-left transition ${
                  active
                    ? 'border-brand-600 ring-2 ring-brand-600'
                    : 'border-gray-200 hover:border-brand-400'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{t.settings.themes[theme]}</span>
                  {active && (
                    <span className="text-xs font-semibold text-brand-700">✓ {t.settings.selected}</span>
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  {SWATCHES.map((swatch) => (
                    <span key={swatch} className={`h-6 w-6 rounded-full ${swatch}`} />
                  ))}
                  <span className="ml-auto rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                    {t.settings.sample}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Settings
