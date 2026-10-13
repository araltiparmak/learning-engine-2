import type { ReactNode } from 'react'
import { useRevealed } from '../lib/useRevealed'
import { t } from '../i18n'

// The "reveal the answer" exercise list: question → answer pairs, where clicking shows
// the answer in place. Used both by the `reveal` block in the lesson JSON and by
// RevealExercises in lessonBlocks, so the toggle logic lives in one place.
function Reveal({ intro, items }: { intro?: string; items: { q: string; a: ReactNode }[] }) {
  const { isRevealed, toggle } = useRevealed()
  return (
    <div>
      {intro && <p className="mt-2 text-sm text-gray-600">{intro}</p>}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((ex, i) => (
          <li key={ex.q}>
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm transition hover:border-brand-400"
            >
              <span>{ex.q}</span>
              <span className={isRevealed(i) ? 'font-semibold text-brand-700' : 'text-gray-400'}>
                {isRevealed(i) ? ex.a : t.lesson.showAnswer}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Reveal
