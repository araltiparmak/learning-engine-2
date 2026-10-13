import data from '#content/pages/listening.json'
import type { Question } from '../components/ReadingQuestions'
import type { Level } from '../config/types'

// Listening tests (/dinleme, /dinleme/:id): a two-person dialogue with its own audio
// (public/audio/de/listening/<id>.mp3); a day of the daily plan points at one by id.

// `tr` is still in the data but no longer shown: the English line replaced it.
type Turn = { speaker: string; de: string; tr?: string; en?: string }
type Speaker = { name: string; voice: string; role: string }
type Gloss = { de: string; tr: string; note?: string }
/** A grammar structure the recording carries; `to` links its lesson. */
type Structure = { label: string; pattern: string; to?: string }

export type ListeningTest = {
  id: string
  emoji: string
  title: string
  titleTr: string
  thema: string
  level: Level
  /** Length of the recording. */
  seconds: number
  structures: Structure[]
  speakers: Speaker[]
  transcript: Turn[]
  glossar: Gloss[]
  questions: Question[]
}

export const listeningIntro: string = data.intro
export const listeningTests = data.tests as ListeningTest[]
