import { useState } from 'react'
import { shuffle } from '../../lib/shuffle'
import { sourceRows } from '../../data/sources'
import SpeakButton from '../SpeakButton'
import TipBox from '../TipBox'
import { NextButton, OptionGrid, QuizResult, QuizShell, type QuizEngineProps } from './QuizFrame'
import { fillSentence } from './fillSentence'
import type { FillBlankItem } from '../../data/quizzes'

type Question = FillBlankItem & { qid: number; options: string[] }

const POOL_SIZE = 50
const MIN_GAP = 3
const MAX_GAP = 6

function buildQueue(source: string, size: number): Question[] {
  const pool = sourceRows<FillBlankItem>(source, 'quiz')
  return shuffle(pool)
    .slice(0, size)
    .map((item, qid) => ({ ...item, qid, options: shuffle([item.correct, ...item.wrong.slice(0, 3)]) }))
}

// The marathon engine: `count` questions (50 by default) are drawn at random from a
// large pool (say 150). A question answered wrongly is pulled out of the queue and
// re-inserted 3–6 questions later, so a session can total more than `count` questions —
// it ends only once every question in the pool has been answered correctly at least once.
function MarathonQuiz({ def, embedded = false }: QuizEngineProps) {
  const size = def.count ?? POOL_SIZE
  const [queue, setQueue] = useState<Question[]>(() => buildQueue(def.source, size))
  const [askedIds, setAskedIds] = useState<Set<number>>(new Set())
  const [solved, setSolved] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  if (queue.length === 0 && !finished) return null

  const restart = () => {
    setQueue(buildQueue(def.source, size))
    setAskedIds(new Set())
    setSolved(0)
    setFirstTryCorrect(0)
    setAnswer(null)
    setFinished(false)
  }

  if (finished) {
    return (
      <QuizResult
        embedded={embedded}
        score={firstTryCorrect}
        total={size}
        lessonPath={def.lessonPath}
        onRestart={restart}
        perfectText={`Efsane! ${size} sorunun hepsini ilk seferde bildin. 🏆`}
      >
        <p className="mt-2 text-sm text-gray-500">
          Yanlış yaptığın sorular birkaç soru sonra tekrar geldi ve hepsini sonunda doğru bildin — maraton
          böyle çalışır.
        </p>
      </QuizResult>
    )
  }

  const question = queue[0]
  const isRepeat = askedIds.has(question.qid)
  const fullSentence = fillSentence(question.sentence, question.correct)
  const wasCorrect = answer !== null && answer === question.correct
  const isLast = wasCorrect && queue.length === 1

  const submit = (option: string) => {
    if (answer !== null) return
    setAnswer(option)
    const correct = option === question.correct
    if (!isRepeat) {
      setAskedIds((s) => new Set(s).add(question.qid))
      if (correct) setFirstTryCorrect((c) => c + 1)
    }
    if (correct) setSolved((s) => s + 1)
  }

  const next = () => {
    const rest = queue.slice(1)
    if (!wasCorrect) {
      const gap = MIN_GAP + Math.floor(Math.random() * (MAX_GAP - MIN_GAP + 1))
      rest.splice(Math.min(gap, rest.length), 0, question)
    }
    setAnswer(null)
    if (rest.length === 0) setFinished(true)
    else setQueue(rest)
  }

  return (
    <QuizShell title={def.title} embedded={embedded} current={solved} total={size} score={firstTryCorrect}>
      {isRepeat && !wasCorrect && (
        <p className="mt-2 text-xs font-semibold text-brand-600">🔁 Bu soruyu daha önce yanlış bildin</p>
      )}
      <p className="mt-6 text-lg italic">{question.sentence}</p>
      <p className="mt-1 text-sm text-gray-500">{question.tr}</p>

      <OptionGrid options={question.options} correct={question.correct} selected={answer} onSelect={submit} />

      {answer !== null && (
        <>
          <NextButton isLast={isLast} onClick={next} className="mt-4" />
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-gray-700">
            <span className="italic">{fullSentence}</span>
            <SpeakButton text={fullSentence} />
          </div>
          <TipBox className="mt-3">{question.reason}</TipBox>
        </>
      )}
    </QuizShell>
  )
}

export default MarathonQuiz
