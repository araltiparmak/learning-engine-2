import EmailOrderBuilder from '../EmailOrderBuilder'
import { shuffle } from '../../lib/shuffle'
import { sourceRows } from '../../data/sources'
import { QuizResult, QuizShell, type QuizEngineProps } from './QuizFrame'
import { useQuizRun } from './useQuizRun'

// The quiz for ordering e-mail sentences: SentenceOrderQuiz at e-mail level.
// Questions come from the `emailSiralama` array in the lesson's data file.
type Exercise = {
  subject?: string
  tr?: string
  lines: string[]
  tip?: string
}

const QUESTION_COUNT = 4

function EmailOrderQuiz({ def, embedded = false }: QuizEngineProps) {
  const count = def.count ?? QUESTION_COUNT
  const run = useQuizRun<Exercise, 'success' | 'fail'>(() =>
    shuffle(sourceRows<Exercise>(def.source, 'emailSiralama')).slice(0, count),
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
        perfectText="Tüm e-postaları ilk denemede doğru sıraladın! 🏆"
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
      {ex.subject && (
        <p className="mt-4 text-sm text-gray-500">
          Konu: <span className="font-medium text-gray-800">{ex.subject}</span>
        </p>
      )}
      <p className="mt-1 text-gray-700">Cümleleri doğru sıraya diz.</p>
      <EmailOrderBuilder
        key={ex.lines.join('|')}
        lines={ex.lines}
        tr={ex.tr}
        tip={ex.tip}
        onResult={(result) => result && run.submit(result, result === 'success')}
        onSolved={run.next}
        labels={{ continue: run.isLast ? 'Bitir →' : 'Sonraki e-posta →' }}
      />
    </QuizShell>
  )
}

export default EmailOrderQuiz
