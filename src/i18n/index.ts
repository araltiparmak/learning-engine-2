import { fromLang } from './lang'
import tr from './tr'
import en from './en'

export { fromLang, fromLangs, switchFromLang, LANG_NAMES, type FromLang } from './lang'
export { localize, translationKey } from './localize'

/** The UI text for the learner's language (see ./tr.tsx for the keys). */
export const t = fromLang === 'en' ? en : tr

/**
 * The meaning of a target-language line in the learner's language: `en` for an English
 * reader when the row has one, `tr` otherwise (also the fallback for untranslated rows).
 */
export function gloss(row: { tr?: string; en?: string }): string | undefined {
  return fromLang === 'en' ? (row.en ?? row.tr) : row.tr
}

/**
 * The English meaning a Turkish reader sees next to the Turkish one ("tr · en"). Nothing
 * for an English reader: for them it is already the main meaning (gloss).
 */
export function secondGloss(row: { en?: string }): string | undefined {
  return fromLang === 'tr' ? row.en : undefined
}

// Felix's writing check and word lookup answer in Turkish (the prompts in
// api/correction.ts explain in Turkish). Until they learn another language, they are
// offered to Turkish readers only.
export const felixAvailable = fromLang === 'tr'
