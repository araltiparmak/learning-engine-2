import { useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import { language } from '../../lib/language'
import TipBox from '../TipBox'
import { NextButton, QuizResult, QuizShell, type QuizEngineProps } from './QuizFrame'
import { useQuizRun } from './useQuizRun'
import {
  formItems,
  formSettings,
  questionCount,
  rowText,
  tipOf,
  type FormItem,
  type FormQuizSettings,
} from './formQuiz'

// Type the answer for a row (see ./formQuiz.ts for the settings). A typed answer that
// matches only after the content pack's letter folds (language.json → typing: in German
// "gehort"/"gehoert" for "gehört") still counts, but the learner is told what was off.
type Result = 'correct' | 'nearMiss' | 'wrong'

const typing = language.typing

function normalize(text: string) {
  let out = text.trim().toLowerCase()
  for (const [from, to] of typing?.folds ?? []) out = out.replaceAll(from, to)
  return out
}

const buildQuestions = (source: string, settings: FormQuizSettings) =>
  shuffle(formItems(source, settings)).slice(0, questionCount(settings))

function FormWriteQuiz({ def, embedded = false }: QuizEngineProps) {
  const settings = formSettings(def.source)
  const run = useQuizRun<FormItem, Result>(() => buildQuestions(def.source, settings))
  const [input, setInput] = useState('')
  const [nearMisses, setNearMisses] = useState(0)

  const next = () => {
    setInput('')
    run.next()
  }

  const restart = () => {
    setInput('')
    setNearMisses(0)
    run.restart()
  }

  if (run.finished) {
    return (
      <QuizResult
        embedded={embedded}
        score={run.score}
        total={run.total}
        lessonPath={def.lessonPath}
        onRestart={restart}
        perfectText="Mükemmel! Hepsini doğru yazdın. 🏆"
      >
        {nearMisses > 0 && (
          <p className="mt-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-gray-700">
            ✍️ {nearMisses} {typing?.nearMissSummary}
          </p>
        )}
      </QuizResult>
    )
  }

  const item = run.question
  const answer = rowText(item, settings.answer)

  const check = () => {
    if (run.answered || input.trim() === '') return
    if (input.trim().toLowerCase() === answer.toLowerCase()) {
      run.submit('correct', true)
    } else if (normalize(input) === normalize(answer)) {
      setNearMisses((n) => n + 1)
      run.submit('nearMiss', true)
    } else {
      run.submit('wrong', false)
    }
  }

  return (
    <QuizShell
      title={def.title}
      embedded={embedded}
      current={run.current}
      total={run.total}
      score={run.score}
    >
      <p className="mt-6 text-lg">
        <strong>{rowText(item, settings.prompt)}</strong>{' '}
        <span className="text-gray-500">
          ({item.row.tr} · {item.row.en})
        </span>{' '}
        {settings.write?.question}
      </p>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          check()
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={run.answered}
          autoFocus={!embedded}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={settings.write?.placeholder}
          aria-label={settings.write?.label}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-brand-500 focus:outline-none sm:w-64"
        />
        {!run.answered && (
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700"
          >
            Kontrol et
          </button>
        )}
      </form>

      {run.answer === 'correct' && (
        <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800">
          ✓ Doğru!
        </div>
      )}
      {run.answer === 'nearMiss' && (
        <div className="mt-4 rounded-lg border border-brand-300 bg-brand-50 px-4 py-3 text-brand-900">
          ✓ Doğru saydık — ama doğru yazım: <strong>{answer}</strong>. {typing?.nearMiss}
        </div>
      )}
      {run.answer === 'wrong' && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
          ✗ Yanlış. Doğrusu: <strong>{answer}</strong>
        </div>
      )}

      {run.answered && (
        <>
          <TipBox className="mt-3">{tipOf(item, settings)}</TipBox>
          <NextButton isLast={run.isLast} onClick={next} autoFocus={!embedded} />
        </>
      )}
    </QuizShell>
  )
}

export default FormWriteQuiz
