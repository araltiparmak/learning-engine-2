import data from '#content/pages/lesen.json'
import type { Question } from '../components/ReadingQuestions'
import type { Level } from '../config/types'

// Reading texts (/okuma, /okuma/:id); a day of the daily plan points at one by id.

type Paragraph = { de: string; tr: string }
type Gloss = { de: string; tr: string; note?: string }

export type ReadingText = {
  id: string
  emoji: string
  title: string
  titleTr: string
  thema: string
  /** A1, A2 or B1; the lesson path places each text after a section. */
  level?: Level
  intro: string
  /** Lessons behind the structures the text uses, shown as links above it. */
  grammatik?: { label: string; to: string }[]
  text: Paragraph[]
  glossar: Gloss[]
  questions: Question[]
}

export const readingIntro: string = data.intro
export const readingTexts = data.texte as ReadingText[]
