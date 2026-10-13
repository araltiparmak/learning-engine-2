import type { ComponentType } from 'react'
import type { QuizEngineProps } from './QuizFrame'
import FillBlankQuiz from './FillBlankQuiz'
import SentenceOrderQuiz from './SentenceOrderQuiz'
import LevelMixQuiz from './LevelMixQuiz'
import ReviewPackageQuiz from './ReviewPackageQuiz'
import FormChoiceQuiz from './FormChoiceQuiz'
import FormWriteQuiz from './FormWriteQuiz'
import EmailOrderQuiz from './EmailOrderQuiz'
import MarathonQuiz from './MarathonQuiz'

// The whitelist mapping the `engine` field in quizzes.json to a component (same pattern
// as lessons/index.ts). Omitting `engine` selects fillBlank.
//
// fillBlank, satzbau, seviyeKarisik and tekrarPaketi are in every build: pages embed
// fill-blank quizzes of their own and the pooling engines compose the others. Every other
// entry enters a build only when that target's quizzes.json names it —
// import.meta.env.VITE_ENGINE_<key> is set by vite/contentUsage.ts, written out in full
// because only the literal expression is replaced at build time.
//
// The keys are data values written in quizzes.json, so they stay as they are.
export const quizEngines: Record<string, ComponentType<QuizEngineProps> | false> = {
  fillBlank: FillBlankQuiz,
  satzbau: SentenceOrderQuiz,
  seviyeKarisik: LevelMixQuiz,
  tekrarPaketi: ReviewPackageQuiz,
  // Form quizzes: what they ask is the source's `formQuiz` settings (see ./formQuiz.ts).
  partizipSecme: import.meta.env.VITE_ENGINE_partizipSecme && FormChoiceQuiz,
  partizipYazma: import.meta.env.VITE_ENGINE_partizipYazma && FormWriteQuiz,
  habenSeinFiil: import.meta.env.VITE_ENGINE_habenSeinFiil && FormChoiceQuiz,
  emailSiralama: import.meta.env.VITE_ENGINE_emailSiralama && EmailOrderQuiz,
  maraton: import.meta.env.VITE_ENGINE_maraton && MarathonQuiz,
}
