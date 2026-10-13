// The active build target is chosen at build time via VITE_LANG, the name of a content
// pack (content/<target>/). vite.config.ts reads the pack's target.json and injects the
// values read here (`define`). Each target is its own site with its own domain.
//
// This module is deliberately a leaf (no heavy imports) — base components such as
// De and SpeakButton read the target-language badge and locale from here without
// creating an import cycle. The values are constants after the build, so the strings
// of the other targets never reach the bundle.

// The taught language's code ('de', 'en'); targets that teach the same language differ
// only in their content. Also names the audio folder (public/audio/<code>/).
export const activeLang: string = import.meta.env.VITE_TARGET_LANG

export const targetBadge = activeLang.toUpperCase()
export const targetLocale: string = import.meta.env.VITE_TARGET_LOCALE

export const brand: string = import.meta.env.VITE_BRAND
