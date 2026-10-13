import type { ReactNode } from 'react'
import { Link } from 'react-router'
import Mascot from '../Mascot'
import type { QuizDef } from '../../data/quizzes'
import { t } from '../../i18n'

// The shell every quiz engine shares: title + progress, result screen, next button.
// When `embedded` is true the quiz is shown inside a lesson; the "back to quizzes" and
// "back to lesson" links make no sense there, so they are hidden and the headings shrink.

// Every engine takes the same props, so QuizPage and the lesson page can render an
// engine without knowing which one it is.
export type QuizEngineProps = {
  def: QuizDef
  embedded?: boolean
}

export function QuizShell({
  title,
  embedded,
  current,
  total,
  score,
  children,
}: {
  title: string
  embedded: boolean
  current: number
  total: number
  score: number
  children: ReactNode
}) {
  const Tag = embedded ? 'div' : 'section'
  return (
    <Tag className={embedded ? undefined : 'max-w-xl'}>
      {!embedded && (
        <Link to="/quiz" className="text-sm text-brand-600 hover:underline">
          {t.quiz.backToList}
        </Link>
      )}
      <div className={`flex items-center justify-between gap-3 ${embedded ? '' : 'mt-2'}`}>
        <h2 className={`font-bold ${embedded ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>{title}</h2>
        <span className="shrink-0 text-sm text-gray-500">
          {current + 1} / {total} · {score}
        </span>
      </div>
      {children}
    </Tag>
  )
}

export function QuizResult({
  embedded,
  score,
  total,
  lessonPath,
  onRestart,
  perfectText = t.quiz.perfect,
  children,
}: {
  embedded: boolean
  score: number
  total: number
  lessonPath?: string
  onRestart: () => void
  perfectText?: string
  children?: ReactNode
}) {
  const Tag = embedded ? 'div' : 'section'
  return (
    <Tag className={embedded ? undefined : 'max-w-xl'}>
      <Mascot mood={score === total ? 'celebrate' : 'happy'} className="w-24" />
      <h2 className={`mt-3 font-bold ${embedded ? 'text-2xl' : 'text-3xl'}`}>{t.quiz.finished}</h2>
      <p className="mt-4 text-xl">
        {t.quiz.score}{' '}
        <span className="font-bold text-brand-600">
          {score} / {total}
        </span>
      </p>
      <p className="mt-2 text-gray-600">
        {score === total
          ? perfectText
          : score >= total / 2
            ? t.quiz.good
            : t.quiz.weak}
      </p>
      {children}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onRestart}
          className="rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700"
        >
          {t.quiz.retry}
        </button>
        {!embedded && lessonPath && (
          <Link
            to={lessonPath}
            className="rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            {t.quiz.backToLesson}
          </Link>
        )}
      </div>
    </Tag>
  )
}

export function NextButton({
  isLast,
  onClick,
  autoFocus,
  className = 'mt-5',
}: {
  isLast: boolean
  onClick: () => void
  autoFocus?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      autoFocus={autoFocus}
      className={`${className} rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700`}
    >
      {isLast ? t.quiz.seeResult : t.quiz.nextQuestion}
    </button>
  )
}

// Option grid. `layout`: pair = two equal columns (short answers), stack = stacked on
// mobile and two columns on wide screens (long answers).
export function OptionGrid<T extends string>({
  options,
  correct,
  selected,
  onSelect,
  label,
  layout = 'pair',
}: {
  options: readonly T[]
  correct: T
  selected: T | null
  onSelect: (option: T) => void
  label?: (option: T) => ReactNode
  layout?: 'pair' | 'stack'
}) {
  return (
    <div
      className={`mt-4 grid gap-3 ${layout === 'pair' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}
    >
      {options.map((option) => {
        const isCorrect = option === correct
        const isSelected = option === selected
        let style = 'border-gray-200 bg-white hover:border-brand-400'
        if (selected !== null) {
          if (isCorrect) style = 'border-green-500 bg-green-50 font-semibold'
          else if (isSelected) style = 'border-red-500 bg-red-50'
          else style = 'border-gray-200 bg-white opacity-60'
        }
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={selected !== null}
            className={`rounded-lg border px-4 py-3 transition ${layout === 'pair' ? 'text-center' : 'text-left'} ${style}`}
          >
            {label ? label(option) : option}
            {selected !== null && isCorrect && ' ✓'}
            {selected !== null && isSelected && !isCorrect && ' ✗'}
          </button>
        )
      })}
    </div>
  )
}
