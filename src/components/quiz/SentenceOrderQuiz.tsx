import SentenceBuilder, { type SentenceElement } from '../SentenceBuilder'
import { shuffle } from '../../lib/shuffle'
import { sourceRows } from '../../data/sources'
import { QuizResult, QuizShell, type QuizEngineProps } from './QuizFrame'
import { useQuizRun } from './useQuizRun'
import { gloss, t } from '../../i18n'

// The sentence-building quiz: the Sprachberg game in its under-a-lesson form. Shared
// by both languages (like FillBlankQuiz) — the role captions and the word-order hint
// come from SentenceBuilder, which reads them from the active language. The
// learner clicks words in order to build the sentence; roles are colour-coded and a
// wrong order produces a hint. Questions come from the `satzbau` array in the lesson's
// data file.
type Exercise = {
  sentence: string
  tr: string
  en?: string
  parts: SentenceElement[]
  distractors?: SentenceElement[]
  altSentences?: string[]
  tipWrong?: string
  tipOrder?: string
}

const QUESTION_COUNT = 10

function SentenceOrderQuiz({ def, embedded = false }: QuizEngineProps) {
  const count = def.count ?? QUESTION_COUNT
  const run = useQuizRun<Exercise, 'success' | 'fail'>(() =>
    shuffle(sourceRows<Exercise>(def.source, 'satzbau')).slice(0, count),
  )

  if (run.total === 0) return null

  if (run.finished) {
    return (
      <QuizResult
        embedded={embedded}
        score={run.score}
        total={run.total}
        lessonPath={def.lessonPath}
        onRestart={run.restart}
        perfectText={t.quiz.allFirstTry}
      />
    )
  }

  const ex = run.question

  return (
    <QuizShell
      title={def.title}
      embedded={embedded}
      current={run.current}
      total={run.total}
      score={run.score}
    >
      <p className="mt-4 text-gray-700">
        {t.quiz.buildThis} <span className="font-medium text-gray-900">{gloss(ex)}</span>
      </p>
      <SentenceBuilder
        key={ex.sentence}
        sentence={ex.sentence}
        tr={gloss(ex) ?? ''}
        parts={ex.parts}
        distractors={ex.distractors}
        altSentences={ex.altSentences}
        tipWrong={ex.tipWrong}
        tipOrder={ex.tipOrder}
        // The first result decides the score (useQuizRun ignores a second call), so
        // arriving at the answer by trial and error does not earn full marks.
        onResult={(result) => result && run.submit(result, result === 'success')}
        onSolved={run.next}
        labels={{ continue: run.isLast ? t.quiz.finish : t.quiz.nextSentence }}
      />
    </QuizShell>
  )
}

export default SentenceOrderQuiz
