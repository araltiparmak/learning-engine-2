import site from '#content/site.json'
import { SITES } from './sites'
import type { LangConfig, LessonSection, SiteCopy } from './types'

// The active target's site copy, assembled from its content pack (content/<target>/,
// bound to '#content' at build time — see the TARGETS table in vite.config.ts):
//   site.json              one entry per explanation language: nav, home, about
//   lessons/list.json      the Turkish lesson list
//   lessons/<lang>/list.json  the list for another explanation language
// A copy's `about.siblings` names other sites by their key in ./sites.ts.
//
// Deliberately light: the app shell imports this for navigation, so only the lists
// (lesson cards) come along — never a lesson document.

type SiteKey = keyof typeof SITES
type RawCopy = Omit<SiteCopy, 'lessonsList' | 'about'> & {
  about: { intro: string; siblings: string[] }
}

const lists = import.meta.glob<LessonSection[]>('#content/lessons/**/list.json', {
  eager: true,
  import: 'default',
})

// '…/lessons/list.json' → 'tr', '…/lessons/en/list.json' → 'en'
function listFor(lang: string): LessonSection[] {
  for (const [path, list] of Object.entries(lists)) {
    const folder = path.split('/').at(-2)
    if ((folder === 'lessons' ? 'tr' : folder) === lang) return list
  }
  return []
}

const langConfig = Object.fromEntries(
  Object.entries(site as Record<string, RawCopy>).map(([lang, copy]) => [
    lang,
    {
      ...copy,
      lessonsList: listFor(lang),
      about: { ...copy.about, siblings: copy.about.siblings.map((key) => SITES[key as SiteKey]) },
    } satisfies SiteCopy,
  ]),
) as LangConfig

export default langConfig
