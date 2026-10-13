// Shared data (source files, the quiz registry, page JSON) is written once, in Turkish,
// with an optional translation next to any text field — `reason` → `reasonEn`,
// `tipWrong` → `tipWrongEn`. localize() returns the data as a reader of `lang` sees it:
// every field with a translation for that language is replaced by it, and all
// translation keys are dropped. Turkish is the base and carries no suffix.
//
// A field without a translation keeps its Turkish text, so a half-translated file still
// renders — a component that knows nothing about languages shows Turkish, never a gap.
//
// Meanings are the exception: a German line's meaning is already written as `tr` + `en`
// (a Turkish reader sees both), so readers pick it with gloss() in ./index.ts instead.
//
// Import-free on purpose: the lesson-meta build plugin runs this in Node.

// One suffix per non-Turkish explanation language (FromLang in config/types.ts).
const SUFFIXES = ['En']

export function translationKey(field: string, lang: string): string {
  return field + lang[0].toUpperCase() + lang.slice(1)
}

function isTranslationKey(key: string, obj: Record<string, unknown>): boolean {
  return SUFFIXES.some((s) => key.length > s.length && key.endsWith(s) && key.slice(0, -s.length) in obj)
}

export function localize<T>(data: T, lang: string): T {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (!node || typeof node !== 'object') return node
    const obj = node as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (isTranslationKey(key, obj)) continue
      const translated = lang === 'tr' ? undefined : obj[translationKey(key, lang)]
      out[key] = walk(translated ?? value)
    }
    return out
  }
  return walk(data) as T
}
