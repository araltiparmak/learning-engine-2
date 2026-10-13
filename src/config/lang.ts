// The active build target is chosen at build time via VITE_LANG — see the TARGETS
// table in vite.config.ts, which injects the two values read here (`define`). Three
// targets, three separate domains: 'de' (Deutsch Lernen), 'en' (temel İngilizce),
// 'en-business' (İş İngilizcesi).
//
// This module is deliberately a leaf (no heavy imports) — base components such as
// De and SpeakButton read the target-language badge and locale from here without
// creating an import cycle. The values are constants after the build, so the strings
// of the other targets never reach the bundle.

// The taught language's code ('de', 'en'); both English targets teach the same language,
// only their content differs. Also names the audio folder (public/audio/<code>/).
export const activeLang: string = import.meta.env.VITE_TARGET_LANG

export const targetBadge = activeLang.toUpperCase()
export const targetLocale: string = import.meta.env.VITE_TARGET_LOCALE

export const brand: string = import.meta.env.VITE_BRAND ?? 'Deutsch Lernen'
