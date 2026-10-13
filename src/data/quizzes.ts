import quizzesData from '#content/quizzes.json'
import meta from 'virtual:lesson-meta'
import config, { type Level } from '../config'
import { cached } from '../lib/cached'
import { fromLang, localize, t, translationKey } from '../i18n'
import { loadSources, sourceRows } from './sources'

// The SINGLE registry of the active language's quizzes (content/<target>/quizzes.json;
// the '#content/quizzes.json' alias picks which one at build time). All three consumers read
// from here:
//   1) the quiz section under a lesson (LessonQuizzes — matched by lesson slug),
//   2) the standalone /quiz/<slug> page (QuizPage),
//   3) the list on the Quiz tab (Quiz page).
// Adding a quiz = one entry in quizzes.json (+ data under sources/ if it needs any). A lesson
// quiz whose source also has a `satzbau` pool brings a sentence-building quiz along by
// itself; list one in quizzes.json only to give it its own title or description.
// Level is not stored here; it is read from the lesson — so B1 changes one place only.

export type FillBlankItem = {
  sentence: string
  correct: string
  wrong: string[]
  tr: string
  /** The sentence's meaning for an English reader (see gloss in src/i18n). */
  en?: string
  reason: string
}

type RawQuiz = {
  slug: string
  /** The lesson this belongs to. Omitted for general/mixed quizzes. */
  lesson?: string
  title: string
  listTitle?: string
  description: string
  engine?: string
  source?: string
  count?: number
  level?: Level
}

export type QuizDef = {
  slug: string
  /** Slug of the lesson it belongs to; empty for general quizzes. */
  lesson: string
  /** Link back to the lesson; empty when there is none (the result screen hides it). */
  lessonPath: string
  /** Title shown inside the quiz. */
  title: string
  /** Title shown in listings; falls back to `title`. */
  listTitle: string
  description: string
  /** Which quiz engine — see components/quiz/engines.ts */
  engine: string
  /** Source file the data comes from; read by engines that vary per language/lesson. */
  source: string
  /** Optional override for the number of questions. */
  count?: number
  /**
   * Only for pooling engines (seviyeKarisik): which lessons' quizzes to gather, by level.
   * A quiz's OWN level is never stored here — it is read from the lesson it belongs to.
   */
  level: Level
  /**
   * Questions supplied by the caller — only page-embedded quizzes (inlineQuiz) and engines
   * composing other engines set it. Registry quizzes read theirs from the source file:
   * see quizItems().
   */
  items?: FillBlankItem[]
}

function build(q: RawQuiz): QuizDef {
  const engine = q.engine ?? 'fillBlank'
  return {
    slug: q.slug,
    lesson: q.lesson ?? '',
    lessonPath: q.lesson ? `/dersler/${q.lesson}` : '',
    title: q.title,
    listTitle: q.listTitle ?? q.title,
    description: q.description,
    engine,
    source: q.source ?? '',
    count: q.count,
    level: q.level ?? '',
  }
}

// A quiz reaches a reader of another language only when it can be read: a lesson quiz
// once its lesson exists in that language (it is in that language's list), a general
// quiz once its title is translated (`titleEn`). Turkish readers get every quiz.
const listed = new Set(config.lessonsList.flatMap((s) => s.lessons.map((l) => l.slug)))
const available = (q: RawQuiz) =>
  fromLang === 'tr' ||
  (q.lesson ? listed.has(q.lesson) : translationKey('title', fromLang) in q)

// The default sentence-building quiz of a lesson quiz (see `sentenceOrder` in
// vite/lessonMeta.ts for when there is one). Its slug is the one the registry entries
// used before, so links to /quiz/<lesson>-satzbau keep working.
const withSentenceOrder = (q: RawQuiz): RawQuiz[] =>
  meta.sentenceOrder.includes(q.slug)
    ? [q, { slug: `${q.lesson}-satzbau`, lesson: q.lesson, source: q.source, engine: 'satzbau', ...t.quiz.sentenceOrder }]
    : [q]

const quizList: QuizDef[] = (quizzesData as RawQuiz[])
  .flatMap(withSentenceOrder)
  .filter(available)
  .map((q) => build(localize(q, fromLang)))

export const quizzes: Record<string, QuizDef> = Object.fromEntries(
  quizList.map((q) => [q.slug, q]),
)

/** A lesson's quizzes — used by the section under a lesson page and the Quiz list. */
export function quizzesForLesson(lessonSlug: string): QuizDef[] {
  return quizList.filter((q) => q.lesson === lessonSlug)
}

/**
 * The fillBlank questions of a quiz: its own `items` if the caller supplied them,
 * otherwise the `quiz` array of its source file (loaded by loadQuiz / loadLesson first).
 */
export function quizItems(def: QuizDef): FillBlankItem[] {
  return def.items ?? (def.source ? sourceRows<FillBlankItem>(def.source, 'quiz') : [])
}

/** Size of a fillBlank quiz's question pool, known without loading the pool. */
export function quizPoolSize(def: QuizDef): number {
  return def.engine === 'fillBlank' ? (meta.quizPool[def.source] ?? 0) : 0
}

/**
 * The fillBlank quizzes of every lesson whose level covers `level` (A2, B1…) — the pool
 * the level-mix engine (seviyeKarisik) draws from.
 */
export function levelQuizzes(level: Level): { def: QuizDef; lessonTitle: string }[] {
  const byLesson = new Map(config.lessonsList.flatMap((s) => s.lessons).map((l) => [l.slug, l]))
  return quizList.flatMap((def) => {
    const lesson = byLesson.get(def.lesson)
    return def.engine === 'fillBlank' && lesson?.level.includes(level)
      ? [{ def, lessonTitle: lesson.title }]
      : []
  })
}

/** The source files a quiz reads while it runs. */
export function quizSources(def: QuizDef): string[] {
  if (def.engine === 'seviyeKarisik') return levelQuizzes(def.level).map((q) => q.def.source)
  return def.source ? [def.source] : []
}

/** Resolves once everything the quiz reads is loaded; await it before rendering one. */
export function loadQuiz(def: QuizDef): Promise<void> {
  return cached(`quiz:${def.slug}`, () => loadSources(quizSources(def)))
}

/** General quizzes not tied to a single lesson (e.g. the A2 overall revision). */
export function generalQuizzes(): QuizDef[] {
  return quizList.filter((q) => !q.lesson)
}

// For page-embedded quizzes that are not in the registry (e.g. the mini quiz on case
// files): questions are supplied by the caller and it never appears on the Quiz tab.
export function inlineQuiz(slug: string, title: string, items: FillBlankItem[]): QuizDef {
  return {
    slug,
    lesson: '',
    lessonPath: '',
    title,
    listTitle: title,
    description: '',
    engine: 'fillBlank',
    source: '',
    level: '',
    items,
  }
}
