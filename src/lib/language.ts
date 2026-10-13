import raw from '#content/language.json'
import { fromLang, localize } from '../i18n'
import type { Tone } from './tones'

// What the engine needs to know about the TAUGHT language, from the content pack
// (content/<target>/language.json): grammar facts a block or engine shows (persons,
// auxiliaries, articles, cases, sentence slots), how typed answers are compared, and
// the copy that names the language to the reader. The engine itself carries none of it,
// so a new language is a new file, not new code.
//
// Every field is optional — a pack only writes what its content uses — and a block
// falls back to a neutral rendering when its part is missing. Text fields follow the
// shared-data rule: Turkish, with an `En` sibling for English readers (localize()).

type Tagged = { tone: Tone }

export type Language = {
  /** The six person labels of a conjugation table, in order. */
  persons?: string[]
  /** Auxiliary → the form a perfect tense line shows (haben → hat). */
  auxiliaries?: Record<string, string>
  /** Articles a dictionary form starts with ("der Tisch"); dropped when matching a word in a sentence. */
  articles?: string[]
  /** The two options of a true/false comprehension question. */
  trueFalse?: [string, string]
  /** The subject line's label in an e-mail sample. */
  emailSubject?: string
  /** Typed answers: letter folds that still count as right, and what the learner is told. */
  typing?: { folds: [string, string][]; nearMiss: string; nearMissSummary: string }
  /** CaseFlow: the legend, keyed by the `kasus` a part names; `untagged` captions the rest. */
  caseFlow?: {
    untagged: string
    cases: Record<string, Tagged & { emoji: string; question: string; role: string }>
  }
  /** SentenceParts: every slot a part may name; `free` is the default. */
  sentenceParts?: { slots: Record<string, Tagged & { name: string; q?: string; dashed?: boolean }> }
  /** TeKaMoLoSlots: a card's tone by its `code`. */
  slotCards?: { tones: Record<string, Tone>; fallback: Tone }
  /** SentenceBuilder: captions by role, and the tip after a wrong order. */
  sentenceBuilder?: { roles: Record<string, string>; orderTip: string }
  /** The prompt on a speaking card. */
  sayPrompt?: string
  /** Felix's writing check: placeholders and lead text in terms of the taught language. */
  writingCheck?: {
    placeholder: string
    translatePlaceholder: string
    focusHint: string
    translateTab: string
    translateLead: string
    pageLead: string
  }
  /** Felix's word lookup. */
  wordLookup?: { placeholder: string; lead: string }
}

export const language: Language = localize(raw as unknown as Language, fromLang)
