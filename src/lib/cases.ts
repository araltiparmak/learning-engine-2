import data from '#content/pages/faelle.json'
import type { FillBlankItem } from '../data/quizzes'
import type { Whodunit } from '../components/WhodunitGame'

// Kommissar Felix's detective cases (/vakalar, /vakalar/:id): one grammar topic told as
// a crime scene, with an optional mini quiz and an optional whodunit game.

type LessonLink = { to: string; label: string }

export type Case = {
  id: string
  nr: number
  title: string
  /** Which CaseScene illustration heads the case. */
  motif: string
  grammar: string
  tatort: string
  erklaerung: { tr: string | string[]; de: string }
  indizien: string[]
  sentences: { de: string; tr: string }[]
  merke: string
  /** Single-topic case: one lesson link. Multi-topic cases use `dersLinks` instead. */
  dersLink?: LessonLink
  dersLinks?: LessonLink[]
  quiz?: FillBlankItem[]
  whodunit?: Whodunit
}

export const casesIntro: string = data.intro
export const cases = data.faelle as Case[]
