import { useState } from 'react'
import { STAGE_LABELS, MASTERED_STAGE, getStage, setStage, setLearned } from '../lib/review'

// Button group for picking a lesson's review state. The choice is stored in a cookie
// (see lib/review.ts); pressing the same button again clears the mark entirely.
// Rendered inside LessonFinish, which supplies the heading and the card around it.
function LearnedToggle({ slug }: { slug: string }) {
  const [stage, setStageState] = useState<number | null>(() => getStage(slug))

  const pick = (i: number) => {
    if (stage === i) {
      setLearned(slug, false)
      setStageState(null)
    } else {
      setStage(slug, i)
      setStageState(i)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {STAGE_LABELS.map((label, i) => {
          const active = stage === i
          const mastered = i === MASTERED_STAGE
          return (
            <button
              key={label}
              type="button"
              onClick={() => pick(i)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                active
                  ? mastered
                    ? 'border-green-300 bg-green-50 text-green-800'
                    : 'border-brand-300 bg-brand-50 text-brand-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-brand-400'
              }`}
            >
              {label}
              {active ? ' ✓' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LearnedToggle
