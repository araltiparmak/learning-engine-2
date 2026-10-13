import meta from 'virtual:lesson-meta'
import type { LessonDoc } from '../../components/LessonRenderer'
import config from '../../config'
import { cached } from '../../lib/cached'
import { fromLang } from '../../i18n'
import { fileSlug, loadSources } from '../sources'
import { quizSources, quizzesForLesson } from '../quizzes'

// Lesson documents for the active language, by slug. The `#content` alias points at
// the active target's content pack (see the TARGETS table in vite.config.ts), so the globs below
// only ever see one language and adding a target needs no new index file. The map is
// built from file names (kein-nicht.json → 'kein-nicht'); list.json is the order/card
// list, not a document, so it is excluded.
//
// The folder's own files are the Turkish documents. A document for another explanation
// language sits in a subfolder named after it (en/kein-nicht.json) with its own list.json,
// and only the reader's language is mapped: an English reader never reaches a Turkish
// document, and a lesson exists for them once its English file does.
//
// Every document is its own lazy chunk: a lesson page downloads that one lesson and the
// sources it draws, never the whole curriculum. The lists that need a number from every
// lesson (reading time) read it from `virtual:lesson-meta`, computed at build time.
// This map is also kept OUTSIDE `config`: the app shell (App.tsx) imports the config
// for navigation, so everything reachable from the config downloads on first paint.
const turkish = import.meta.glob<LessonDoc>(['#content/lessons/*.json', '!#content/lessons/list.json'], {
  import: 'default',
})
const translated = import.meta.glob<LessonDoc>(
  ['#content/lessons/*/*.json', '!#content/lessons/*/list.json'],
  { import: 'default' },
)

// '…/en/kein-nicht.json' → folder 'en' (the slug is fileSlug: 'kein-nicht')
const folderOf = (path: string) => path.split('/').at(-2)

const loaders: Record<string, () => Promise<LessonDoc>> = Object.fromEntries(
  Object.entries(fromLang === 'tr' ? turkish : translated)
    .filter(([path]) => fromLang === 'tr' || folderOf(path) === fromLang)
    .map(([path, load]) => [fileSlug(path), load]),
)

const turkishSlugs = new Set(Object.keys(turkish).map(fileSlug))

export function hasLesson(slug: string): boolean {
  return slug in loaders
}

/** True when the lesson exists in Turkish — for offering it to a reader of another language. */
export function hasTurkishLesson(slug: string): boolean {
  return turkishSlugs.has(slug)
}

/** Estimated study time, from the build-time lesson meta. */
export function lessonMinutes(slug: string): number | undefined {
  return meta.minutes[fromLang]?.[slug]
}

// Every `source` named anywhere in a document — component props, TableCards boxes, …
function sourcesIn(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => sourcesIn(n, found))
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'source' && typeof value === 'string') found.push(value)
      else sourcesIn(value, found)
    }
  }
  return found
}

/**
 * Everything a lesson page draws: the document, the source files its component blocks
 * read and the sources of the quizzes shown under it. Resolves to undefined for an
 * unknown slug. Pass the promise to React's use(); it is cached per slug.
 */
export function loadLesson(slug: string): Promise<LessonDoc | undefined> {
  return cached(`lesson:${slug}`, async () => {
    const load = loaders[slug]
    if (!load) return undefined
    const doc = await load()
    await loadSources([...sourcesIn(doc), ...quizzesForLesson(slug).flatMap(quizSources)])
    return doc
  })
}

/** Several lessons at once, by slug; unknown slugs are left out. */
export function loadLessons(slugs: string[]): Promise<Record<string, LessonDoc>> {
  const unique = [...new Set(slugs)].filter(hasLesson).sort()
  return cached(`lessons:${unique.join('|')}`, async () => {
    const docs = await Promise.all(unique.map(loadLesson))
    return Object.fromEntries(unique.map((slug, i) => [slug, docs[i]!]))
  })
}

// list.json is the only hand-maintained list, so it is the only place drift can appear:
// a slug listed without a file means a broken /dersler/<slug> link, and a file missing
// from the list means a lesson nobody can reach.
if (import.meta.env.DEV) {
  const listed = new Set(config.lessonsList.flatMap((s) => s.lessons.map((l) => l.slug)))
  for (const slug of listed) {
    if (!hasLesson(slug))
      console.warn(`[lesson] list.json contains "${slug}" but ${slug}.json is missing — broken link.`)
  }
  for (const slug of Object.keys(loaders)) {
    if (!listed.has(slug))
      console.warn(`[lesson] ${slug}.json exists but is absent from list.json — it will not be listed.`)
  }
}
