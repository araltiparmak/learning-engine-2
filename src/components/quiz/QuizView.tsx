import type { QuizDef } from '../../data/quizzes'
import { quizEngines } from './engines'

// Renders a quiz definition the same way whatever its engine is.
// If the engine name is missing from the whitelist (a typo in the JSON), it says so.
function QuizView({ def, embedded = false }: { def: QuizDef; embedded?: boolean }) {
  const Engine = quizEngines[def.engine]
  if (!Engine) {
    if (import.meta.env.DEV) {
      console.warn(`[quiz] unknown engine for "${def.slug}": "${def.engine}"`)
    }
    return null
  }
  return <Engine def={def} embedded={embedded} />
}

export default QuizView
