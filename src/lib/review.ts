import { getCookie, setCookie, deleteCookie, getCookieSet, setCookieSetEntry } from './cookies'
import { t } from '../i18n'

// Two cookies kept in step: the set of learned lesson slugs, and each one's review stage.
const LEARNED_COOKIE = 'gelernteLektionen'
const REVIEW_COOKIE = 'lektionTekrar'

/** Number of study stages before a lesson counts as fully learned. */
const REVIEW_STAGE_COUNT = 3

/**
 * Stage labels — the array index is the stage value. "studied N times" means the
 * Nth review is the one now due (stage = times studied - 1). The last entry is the
 * fully-learned state. The text comes from the reader's string table (src/i18n).
 */
export const STAGE_LABELS = [
  ...Array.from({ length: REVIEW_STAGE_COUNT }, (_, i) => t.review.studied(i + 1)),
  t.review.mastered,
]
export const MASTERED_STAGE = STAGE_LABELS.length - 1

export type ReviewEntry = {
  /** Day it was last marked, YYYY-MM-DD — drives ordering and priority. */
  date: string
  /** Review stage: 0 = first review due, … MASTERED_STAGE = fully learned. */
  stage: number
}

export type PendingLesson = { slug: string; stage: number; daysSince: number }

const DAY_MS = 86_400_000

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Calendar-day difference — counts day boundaries crossed, not elapsed hours. */
function daysSince(iso: string, now: Date): number {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return 0
  const then = new Date(y, m - 1, d).getTime()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.round((start - then) / DAY_MS))
}

// Cookie format: slug:YYYY-MM-DD:stage|slug:YYYY-MM-DD:stage
function readReviews(): Map<string, ReviewEntry> {
  const map = new Map<string, ReviewEntry>()
  const raw = getCookie(REVIEW_COOKIE)
  if (!raw) return map
  for (const part of raw.split('|')) {
    const [slug, date, stage] = part.split(':')
    if (!slug || !date) continue
    map.set(slug, { date, stage: Number(stage) || 0 })
  }
  return map
}

function writeReviews(map: Map<string, ReviewEntry>) {
  if (map.size === 0) {
    deleteCookie(REVIEW_COOKIE)
    return
  }
  setCookie(
    REVIEW_COOKIE,
    [...map].map(([slug, e]) => `${slug}:${e.date}:${e.stage}`).join('|'),
  )
}

/** Slugs of the lessons marked as learned. */
export function learnedLessons(): Set<string> {
  return getCookieSet(LEARNED_COOKIE)
}

/** Updates the "learned" flag and the review schedule together. */
export function setLearned(slug: string, learned: boolean) {
  const map = readReviews()
  if (learned) map.set(slug, { date: todayISO(), stage: 0 })
  else map.delete(slug)
  setCookieSetEntry(LEARNED_COOKIE, slug, learned)
  writeReviews(map)
}

/**
 * Reads both cookies once and answers per lesson: its review stage (0, 1, 2, …), or null
 * if it was never learned. For pages that show the stage of many lessons at a time.
 */
export function readStages(): (slug: string) => number | null {
  const learned = learnedLessons()
  const reviews = readReviews()
  return (slug) => (learned.has(slug) ? (reviews.get(slug)?.stage ?? 0) : null)
}

/** The lesson's current review stage (0, 1, 2, …); null if never learned. */
export function getStage(slug: string): number | null {
  return readStages()(slug)
}

/**
 * Sets the stage explicitly (e.g. picking "3rd review" or "fully learned" straight
 * from the list). Moves the date to today — ordering treats it as "last touched".
 */
export function setStage(slug: string, stage: number) {
  const map = readReviews()
  map.set(slug, { date: todayISO(), stage })
  setCookieSetEntry(LEARNED_COOKIE, slug, true)
  writeReviews(map)
}

/**
 * Reconciles the review schedule with the set of learned lessons.
 *
 * Lessons finished before this feature existed carry no date. Since we cannot know
 * when they were finished, the counter starts today — better than inventing a past
 * date. Lessons that lose the "learned" flag drop out of the schedule.
 */
function syncReviews(): Map<string, ReviewEntry> {
  const learned = learnedLessons()
  const map = readReviews()
  let changed = false

  for (const slug of learned) {
    if (!map.has(slug)) {
      map.set(slug, { date: todayISO(), stage: 0 })
      changed = true
    }
  }
  for (const slug of [...map.keys()]) {
    if (!learned.has(slug)) {
      map.delete(slug)
      changed = true
    }
  }

  if (changed) writeReviews(map)
  return map
}

/**
 * Lessons that are not fully learned yet (still awaiting review), longest-untouched
 * first. There is deliberately no day-based waiting threshold — a lesson shows up as
 * soon as a stage is marked, so the lesson list and the home page agree on state.
 */
export function pendingLessons(now = new Date()): PendingLesson[] {
  const pending: PendingLesson[] = []
  for (const [slug, entry] of syncReviews()) {
    if (entry.stage >= MASTERED_STAGE) continue
    pending.push({ slug, stage: entry.stage, daysSince: daysSince(entry.date, now) })
  }
  return pending.sort((a, b) => b.daysSince - a.daysSince)
}

/** Marks one review as done and advances to the next stage. */
export function markReviewed(slug: string) {
  const map = readReviews()
  const entry = map.get(slug)
  if (!entry) return

  map.set(slug, { date: todayISO(), stage: Math.min(entry.stage + 1, MASTERED_STAGE) })
  writeReviews(map)
}
