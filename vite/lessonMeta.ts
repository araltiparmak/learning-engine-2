import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { estimateMinutes } from '../src/lib/lessonTime.ts'
import { localize } from '../src/i18n/localize.ts'

// Build-time facts about the active target's lessons, served as the virtual module
// `virtual:lesson-meta`. They exist so that the pages listing lessons and quizzes can show
// a reading time and a question count without downloading every lesson and source file:
// those files are lazy chunks now (src/data/lessons/index.ts, src/data/sources/index.ts),
// and the numbers below are the only reason the lists ever needed them.
//
//   minutes   explanation language → slug → estimated study time (src/lib/lessonTime.ts,
//             run here in Node). The lessons folder's own files are the Turkish ones;
//             each subfolder (en/…) holds another language's documents.
//   quizPool  source name → length of its `quiz` array (the fillBlank question pool)
//   sentenceOrder  slugs of the lesson quizzes that bring a default satzbau quiz along: their
//             source has a `satzbau` pool and the registry lists no satzbau quiz for that
//             lesson itself (src/data/quizzes.ts builds the quiz)

export type LessonMetaDirs = {
  lessons: string
  sources: string
  quizzes: string
  defaultGroups: Record<string, string>
}

type RawQuiz = { slug: string; lesson?: string; source?: string; engine?: string }

const ID = 'virtual:lesson-meta'
const RESOLVED = `\0${ID}`

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const jsonFiles = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.json'))
const subfolders = (dir: string) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? [e.name] : []))
const name = (file: string) => file.slice(0, -'.json'.length)

function collect(dirs: LessonMetaDirs, warn: (message: string) => void) {
  const sources: Record<string, Record<string, unknown>> = Object.fromEntries(
    jsonFiles(dirs.sources).map((f) => [name(f), readJson(path.join(dirs.sources, f))]),
  )
  const quizzes = readJson(dirs.quizzes) as RawQuiz[]
  const engineOf = (q: RawQuiz) => q.engine ?? 'fillBlank'
  const sentenceOrder = quizzes
    .filter(
      (q) =>
        engineOf(q) === 'fillBlank' &&
        q.lesson &&
        q.source &&
        Array.isArray(sources[q.source]?.satzbau) &&
        !quizzes.some((o) => engineOf(o) === 'satzbau' && o.lesson === q.lesson),
    )
    .map((q) => q.slug)
  const quizCount = (slug: string) =>
    quizzes.filter((q) => q.lesson === slug).length +
    quizzes.filter((q) => q.lesson === slug && sentenceOrder.includes(q.slug)).length

  // Sources are counted as the reader of that language sees them (translations swapped in,
  // the other language's left out), so adding English never inflates a Turkish estimate.
  const minutesIn = (dir: string, lang: string) => {
    const out: Record<string, number> = {}
    const localized: Record<string, Record<string, unknown>> = {}
    for (const file of jsonFiles(dir)) {
      if (file === 'list.json') continue
      const slug = name(file)
      out[slug] = estimateMinutes(readJson(path.join(dir, file)), {
        source: (source) =>
          sources[source] && (localized[source] ??= localize(sources[source], lang)),
        defaultGroups: dirs.defaultGroups,
        quizCount: quizCount(slug),
      })
    }
    return out
  }
  const minutes: Record<string, Record<string, number>> = { tr: minutesIn(dirs.lessons, 'tr') }
  for (const lang of subfolders(dirs.lessons)) {
    minutes[lang] = minutesIn(path.join(dirs.lessons, lang), lang)
  }

  const quizPool: Record<string, number> = {}
  for (const [source, doc] of Object.entries(sources)) {
    if (Array.isArray(doc.quiz)) quizPool[source] = doc.quiz.length
  }
  for (const q of quizzes) {
    if (engineOf(q) === 'fillBlank' && q.source && !quizPool[q.source]) {
      warn(`[quiz] no questions found in ${q.source}.json for "${q.slug}".`)
    }
  }

  return { minutes, quizPool, sentenceOrder }
}

export function lessonMeta(dirs: LessonMetaDirs): Plugin {
  return {
    name: 'lesson-meta',
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null
      return `export default ${JSON.stringify(collect(dirs, (m) => this.warn(m)))}`
    },
    // Content edits in dev recompute the numbers; the module is tiny, so rebuilding it
    // whole on every save costs nothing worth optimising.
    configureServer(server) {
      const watched = [dirs.lessons, dirs.sources, dirs.quizzes]
      server.watcher.on('all', (_event, file) => {
        if (!watched.some((dir) => file.startsWith(dir))) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) void server.reloadModule(mod)
      })
    },
  }
}
