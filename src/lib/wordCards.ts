// The words the learner asked Felix about, kept so a card is still there next time.
//
// localStorage, unlike the rest of the progress state (which lives in cookies): one card
// is a few hundred bytes, so a dozen of them would already blow past the ~4 KB a cookie
// holds — and quietly, by dropping the write. Nothing here is ever read by the server, so
// there is no reason for it to ride along on every request either.

import { readStoredList, writeStoredList } from './storage'

export type WordForm = { label: string; value: string }
export type WordExample = { sentence: string; tr: string }
export type WordOpposite = { word: string; tr: string }

// The card as api/correction.ts (mode 'word') returns it.
export type WordCard = {
  headword: string
  kind: string
  meaningTr: string
  meaningEn: string
  forms: WordForm[]
  examples: WordExample[]
  opposites: WordOpposite[]
  tip: string
}

// `query` is what the learner typed ("gitmek"), `headword` what Felix answered ("gehen").
// Both are kept: the query is how a repeated lookup is recognised as the same word, the
// headword is what the list shows.
export type SavedWord = WordCard & { query: string; savedAt: number }

const KEY = 'kelimeKartlari'
const MAX = 200

export function getWords(): SavedWord[] {
  return readStoredList<SavedWord>(KEY)
}

// Full or unavailable storage: the card stays on screen for this visit.
function write(list: SavedWord[]): SavedWord[] {
  writeStoredList(KEY, list)
  return list
}

// Deduped on the headword, not on the query: "gitmek" and "gehen" are the same card, and
// the newer answer replaces the older one rather than stacking up.
export function saveWord(card: WordCard, query: string): SavedWord[] {
  const key = card.headword.trim().toLowerCase()
  const rest = getWords().filter((w) => w.headword.trim().toLowerCase() !== key)
  return write([{ ...card, query, savedAt: Date.now() }, ...rest].slice(0, MAX))
}

export function removeWord(headword: string): SavedWord[] {
  const key = headword.trim().toLowerCase()
  return write(getWords().filter((w) => w.headword.trim().toLowerCase() !== key))
}
