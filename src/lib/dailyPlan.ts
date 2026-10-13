import data from '#content/pages/dailyPlan.json'
import { getCookieSet, setCookieSetEntry } from './cookies'
import type { Level } from '../config/types'

// The daily study plan (/gunluk, /gunluk/:id). A day owns only its writing task; everything
// else it points at by id — a short pattern lesson (lessons/), a reading text (lesen.json)
// and a listening test (listening.json) — so those stay listed in their own tabs too.
// Every part but the lesson is optional, which leaves room for review days.

export type ModelLine = { de: string; tr?: string }
export type WritingTask = {
  task: string
  use: string[]
  model: ModelLine[]
  /** What Felix is told the text practises; the day's title when absent. */
  topic?: string
}
export type Day = {
  id: string
  level: Level
  theme: string
  emoji?: string
  title: string
  focus: string
  lesson: string
  reading?: string
  listening?: string
  writing?: WritingTask
}

export const planIntro: string = data.intro
export const days = data.days as Day[]
// Days are grouped by the level they carry, so a B1 plan gets its own group just by
// being added to the JSON.
export const levels = [...new Set(days.map((d) => d.level))]

const daysOf = (level: Level) => days.filter((d) => d.level === level)

/** 1-based position within the day's level — the number in "Gün 3". */
export function dayNumber(day: Day): number {
  return daysOf(day.level).indexOf(day) + 1
}

export function nextDay(day: Day): Day | undefined {
  const list = daysOf(day.level)
  return list[list.indexOf(day) + 1]
}

// Ids of the days the learner marked as finished.
const DONE_COOKIE = 'gunlukBitti'

export const doneDays = () => getCookieSet(DONE_COOKIE)

export function setDayDone(id: string, done: boolean) {
  setCookieSetEntry(DONE_COOKIE, id, done)
}
