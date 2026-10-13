/// <reference types="vite/client" />

// Injected by the `define` block in vite.config.ts from the active pack's target.json.
interface ImportMetaEnv {
  readonly VITE_TARGET_LANG: string
  readonly VITE_TARGET_LOCALE: string
  readonly VITE_BRAND: string
  // What the active content pack uses (vite/contentUsage.ts): a lesson block, a quiz
  // engine, a page data file. Each guarded registry entry or route reads its own flag.
  readonly [flag: `VITE_BLOCK_${string}` | `VITE_ENGINE_${string}` | `VITE_PAGE_${string}`]: boolean
}

// Served by vite/lessonMeta.ts: numbers the lesson and quiz lists show, computed at build
// time so those lists never download the lesson and source files themselves.
declare module 'virtual:lesson-meta' {
  const meta: {
    /** Explanation language → lesson slug → estimated study time in minutes. */
    minutes: Record<string, Record<string, number>>
    /** Source name → size of its fillBlank `quiz` pool. */
    quizPool: Record<string, number>
    /** Lesson quizzes whose source's `satzbau` pool becomes a default sentence-building quiz. */
    sentenceOrder: string[]
  }
  export default meta
}
