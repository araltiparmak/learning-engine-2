import data from '#content/pages/lessonPath.json'
import type { Level } from '../config/types'

// Ordered lesson paths, one per level; the German lesson index (/dersler) shows them. A path only points at content by slug, so a
// lesson stays listed under /dersler as before; the path adds an order, prerequisites and
// notes. The order is the data order, written by hand (A2 follows the Goethe A2 grammar
// list); nothing is locked, since a learner may already know earlier lessons. `requires`
// is not shown; it only lets dev mode check that the order keeps prerequisites first.

/** What a step is; a step without `type` is a grammar lesson. */
export type StepKind = 'grammar' | 'reading' | 'listening'

export type PathStep = {
  type?: StepKind
  /**
   * Grammar: lesson slug (/dersler/<slug>). Reading/listening: text or test id
   * (/okuma/<id>, /dinleme/<id>). Absent means a placeholder still to be written.
   */
  slug?: string
  /** Shown for reading/listening steps; a grammar step takes its title from list.json. */
  title?: string
  /** Planned length of a reading/listening piece. */
  minutes?: number
  /** What a reading/listening piece practises. */
  focus?: string
  /** Lessons this one builds on; checked against the order in dev, not shown. */
  requires?: string[]
  /** One line on what the lesson adds; shown on the card. */
  why?: string
  /** Side note, e.g. how much of the lesson an exam covers. */
  note?: string
}
export type PathSection = {
  title?: string
  note?: string
  steps: PathStep[]
}
export type LessonPath = {
  id: string
  level: Level
  title: string
  sections: PathSection[]
}

export const pathIntro: string = data.intro
export const paths: LessonPath[] = data.paths as LessonPath[]

export function stepKind(step: PathStep): StepKind {
  return step.type ?? 'grammar'
}

const routeOf: Record<StepKind, string> = {
  grammar: '/dersler',
  reading: '/okuma',
  listening: '/dinleme',
}

/** Where a step links to, or null for a placeholder. */
export function stepHref(step: PathStep): string | null {
  return step.slug ? `${routeOf[stepKind(step)]}/${step.slug}` : null
}

export function pathSteps(path: LessonPath): PathStep[] {
  return path.sections.flatMap((s) => s.steps)
}

/** Grammar lessons of a path; only they carry a "learned" mark so far. */
export function pathLessons(path: LessonPath): PathStep[] {
  return pathSteps(path).filter((s) => stepKind(s) === 'grammar' && s.slug)
}

if (import.meta.env.DEV) {
  // The order is hand-written, so check it does not put a step before its prerequisite.
  for (const path of paths) {
    const position = new Map(pathSteps(path).map((s, i) => [s.slug, i]))
    pathSteps(path).forEach((step, i) => {
      for (const slug of step.requires ?? []) {
        if ((position.get(slug) ?? -1) > i)
          console.warn(`lessonPath: "${path.id}" lists ${step.slug} before its prerequisite ${slug}`)
      }
    })
  }
}
