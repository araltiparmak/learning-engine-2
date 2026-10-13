import data from '#content/pages/sprechen.json'
import type { LessonDoc } from '../components/LessonRenderer'

// Speaking lessons (/konusma, /konusma/:id). Each carries a lesson document drawn by the
// same LessonRenderer as the grammar lessons; the lessons are deliberately written with
// different methods (`method`, `methodNote`) to see which one works.

export type SpeakingLesson = {
  id: string
  emoji: string
  method: string
  methodNote: string
  title: string
  titleTr: string
  /** What the learner should be able to say afterwards. */
  ziel: string
  doc: LessonDoc
}

export const speakingIntro: string = data.intro
export const speakingLessons = data.lektionen as SpeakingLesson[]
