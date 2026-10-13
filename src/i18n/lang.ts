import langConfig from '../config/site'
import type { FromLang } from '../config/types'
import { getCookie, setCookie } from '../lib/cookies'

// The language the learner reads the site in: UI text and explanations. Not to be
// confused with activeLang (config/lang.ts), the language being TAUGHT, which is fixed
// per build. This one is the learner's pick, from the languages the site's config offers
// (content/<target>/site.json has one entry per explanation language; `tr` always).
//
// It is read once, at startup, and is a constant for the whole page load: switching
// stores the choice and reloads (switchFromLang). Every module that bakes the language
// into a value at import time — the resolved config, the quiz registry, the string table
// — stays right without re-rendering or recomputing anything.
export type { FromLang }

export const fromLangs = Object.keys(langConfig) as FromLang[]

const COOKIE = 'dil'
const saved = getCookie(COOKIE)

export const fromLang: FromLang = (fromLangs as string[]).includes(saved) ? (saved as FromLang) : 'tr'

export function switchFromLang(lang: FromLang) {
  setCookie(COOKIE, lang)
  location.reload()
}

// Each language named in itself, for the language menu.
export const LANG_NAMES: Record<FromLang, string> = { tr: 'Türkçe', en: 'English' }
