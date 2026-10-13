// The raw data files feeding lesson content (table rows, example sentences, quiz
// questions…). Lesson DOCUMENTS are not here; they live under `content/<target>/lessons/`.
//
// The map is built automatically from file names: `content/de/sources/habenSein.json` → key
// `habenSein`. Adding a source means dropping a JSON file into the right language
// folder; no code changes. Since no second hand-maintained list exists, the two cannot
// drift apart.
//
// Which folder arrives is decided at build time: the '#content' alias points at the
// active target's content pack (see vite.config.ts) — the German build never
// downloads the English data, and a new target needs no index file of its own.
//
// Every file is its own lazy chunk, so a page downloads only the sources it draws.
// Components still read them synchronously (sourceRows, sourceField): the pages that render
// them await loadSources() first — through loadLesson() (src/data/lessons) and loadQuiz()
// (src/data/quizzes). A component rendered outside those paths sees an empty source.
//
// Sources are stored localized for the reader (see src/i18n/localize.ts): an English
// reader gets `reasonEn` in `reason`, so components read one field whatever the language.

import { fromLang, localize } from '../../i18n'

/**
 * One source file: named groups of rows (`examples`, `quiz`, `satzbau`…) plus, for some,
 * a settings object (`package`, `review`). Its shape is decided by the components reading
 * it, which name the row type at the call: sourceRows<Pair>(source, group).
 */
type SourceDoc = Record<string, unknown>

/** A data file's key, from its path: '…/hedging.json' → 'hedging'. */
export const fileSlug = (path: string) => path.slice(path.lastIndexOf('/') + 1, -'.json'.length)

const loaders: Record<string, () => Promise<SourceDoc>> = Object.fromEntries(
  Object.entries(import.meta.glob<SourceDoc>('#content/sources/*.json', { import: 'default' })).map(
    ([path, load]) => [fileSlug(path), load],
  ),
)

/** Sources fetched so far, by name. */
const sources: Record<string, SourceDoc> = {}

const pending = new Map<string, Promise<void>>()

/** Fetches the named sources that are not in `sources` yet; unknown names are skipped. */
export function loadSources(names: Iterable<string>): Promise<void> {
  const loads = [...new Set(names)].flatMap((name) => {
    if (name in sources || !loaders[name]) return []
    let load = pending.get(name)
    if (!load) {
      load = loaders[name]().then((doc) => {
        sources[name] = localize(doc, fromLang)
      })
      load.catch(() => pending.delete(name))
      pending.set(name, load)
    }
    return [load]
  })
  return Promise.all(loads).then(() => undefined)
}

// Returns an array from a source; an empty array (plus a dev warning) if the source or
// group name is wrong. `Row` is the row shape the caller expects; the JSON is not checked.
export function sourceRows<Row = unknown>(source: string, group: string): Row[] {
  const rows = sources[source]?.[group]
  if (!Array.isArray(rows)) {
    if (import.meta.env.DEV) {
      console.warn(
        sources[source]
          ? `[sources] "${source}" has no "${group}" array.`
          : loaders[source]
            ? `[sources] "${source}" was rendered before it was loaded — the page must await loadSources().`
            : `[sources] no source named "${source}" (content/<target>/sources/${source}.json?).`,
      )
    }
    return []
  }
  return rows as Row[]
}

/** A non-row field of a source (e.g. a package's `package` settings); undefined if absent. */
export function sourceField<T>(source: string, key: string): T | undefined {
  return sources[source]?.[key] as T | undefined
}
