import { levelQuizzes, quizItems, type FillBlankItem } from '../../data/quizzes'
import FillBlankQuiz from './FillBlankQuiz'
import type { QuizEngineProps } from './QuizFrame'
import type { Level } from '../../config/types'

// The general revision quiz for one level. It has NO question file of its own: it
// gathers its pool from the existing lesson quizzes — the fillBlank quizzes of lessons
// whose level covers `def.level` (A2, B1…). So a new lesson at that level mixes its
// questions in automatically, while other levels never leak in. Language-neutral: the
// level and the question count both come from quizzes.json.
function buildPool(level: Level): FillBlankItem[] {
  return levelQuizzes(level).flatMap(({ def, lessonTitle }) =>
    // In a mixed quiz it must be clear which topic a question came from: the lesson
    // title is prefixed to the explanation, so a wrong answer shows where to go back to.
    quizItems(def).map((item) => ({ ...item, reason: `${lessonTitle} · ${item.reason}` })),
  )
}

function LevelMixQuiz({ def, embedded = false }: QuizEngineProps) {
  if (import.meta.env.DEV && !def.level) {
    console.warn(`[quiz] "${def.slug}" uses the level-mix engine but has no "level" field.`)
  }
  return <FillBlankQuiz def={{ ...def, items: buildPool(def.level) }} embedded={embedded} />
}

export default LevelMixQuiz
