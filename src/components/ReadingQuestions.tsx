import { useState } from 'react'
import Mascot from './Mascot'
import { language } from '../lib/language'

// Comprehension questions under a reading passage or a listening test. Unlike the quiz
// engines, the questions are not shown one at a time: they all stay on screen and are
// answered individually, so the learner can go back and re-read (or replay) the source.
// A question written without options is a true/false question; the two option labels
// come from the content pack (language.json → trueFalse, Richtig/Falsch in German).
export type Question = {
  q: string
  options?: string[]
  correct: string
  reason: string
}

const TRUE_FALSE = language.trueFalse ?? []

// Only the wording differs between the two uses — you re-read a text but replay a
// recording — so the component takes the medium rather than being copied.
const WORDING = {
  text: {
    hint: 'Cevabı seç; doğru da yanlış da olsa metinden gerekçesini göreceksin.',
    perfect: 'Metni tam anladın, harika! 🏆',
    retry:
      'Yanlış yaptığın soruların gerekçesini metinde bir daha ara — cevabın geçtiği cümleyi bulmak en iyi alıştırma.',
  },
  audio: {
    hint: 'Cevabı seç; doğru da yanlış da olsa kayıttan gerekçesini göreceksin.',
    perfect: 'Kaydı tam anladın, harika! 🏆',
    retry:
      'Yanlış yaptığın soruların geçtiği yeri kayıtta bir daha dinle — cevabı yakaladığın cümleyi bulmak en iyi alıştırma. Sonra metni açıp karşılaştır.',
  },
}

function ReadingQuestions({
  questions,
  medium = 'text',
}: {
  questions: Question[]
  medium?: keyof typeof WORDING
}) {
  const wording = WORDING[medium]
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const answeredCount = Object.keys(answers).length
  const score = questions.filter((q, i) => answers[i] === q.correct).length
  const done = answeredCount === questions.length

  const choose = (i: number, option: string) => {
    if (answers[i] !== undefined) return
    setAnswers((prev) => ({ ...prev, [i]: option }))
  }

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold">Sorular</h2>
        <span className="text-sm text-gray-500">
          {answeredCount} / {questions.length} · doğru {score}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{wording.hint}</p>

      <ol className="mt-5 space-y-5">
        {questions.map((question, i) => {
          const options = question.options ?? TRUE_FALSE
          const given = answers[i]
          const answered = given !== undefined
          const isRight = given === question.correct
          return (
            <li
              key={question.q}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="font-medium text-gray-800">
                <span className="mr-1.5 text-gray-400">{i + 1}.</span>
                {question.q}
              </p>
              <div
                className={`mt-3 grid gap-2 ${options.length > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}
              >
                {options.map((option) => {
                  const isCorrect = option === question.correct
                  const isChosen = option === given
                  let style = 'border-gray-200 bg-white hover:border-brand-400'
                  if (answered) {
                    if (isCorrect) style = 'border-green-500 bg-green-50 font-semibold'
                    else if (isChosen) style = 'border-red-500 bg-red-50'
                    else style = 'border-gray-200 bg-white opacity-60'
                  }
                  return (
                    <button
                      key={option}
                      onClick={() => choose(i, option)}
                      disabled={answered}
                      className={`rounded-lg border px-4 py-2 text-left text-sm transition ${style}`}
                    >
                      {option}
                      {answered && isCorrect && ' ✓'}
                      {answered && isChosen && !isCorrect && ' ✗'}
                    </button>
                  )
                })}
              </div>
              {answered && (
                <p
                  className={`mt-3 rounded-lg px-4 py-2 text-sm ${
                    isRight ? 'bg-green-50 text-green-900' : 'bg-brand-50 text-brand-900'
                  }`}
                >
                  <span className="font-semibold">{isRight ? '✓ Doğru. ' : '💡 '}</span>
                  {question.reason}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {done && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3">
          <Mascot mood={score === questions.length ? 'celebrate' : 'happy'} className="w-12 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">
              {score} / {questions.length} doğru
            </p>
            <p className="mt-0.5 text-sm text-green-900/80">
              {score === questions.length ? wording.perfect : wording.retry}
            </p>
            <button
              onClick={() => setAnswers({})}
              className="mt-3 rounded-lg border border-green-600 px-4 py-1.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              Soruları sıfırla
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ReadingQuestions
