import { shuffle } from '../../lib/shuffle'
import SpeakButton from '../SpeakButton'
import TipBox from '../TipBox'
import { NextButton, OptionGrid, QuizResult, QuizShell, type QuizEngineProps } from './QuizFrame'
import { useQuizRun } from './useQuizRun'
import { fillSentence } from './fillSentence'
import { quizItems, type FillBlankItem } from '../../data/quizzes'
import { gloss } from '../../i18n'

type Question = FillBlankItem & { options: string[] }

const QUESTION_COUNT = 10

function buildQuestions(items: FillBlankItem[], count: number): Question[] {
  return shuffle(items)
    .slice(0, count)
    .map((item) => ({
      ...item,
      options: shuffle([item.correct, ...item.wrong.slice(0, 3)]),
    }))
}

// The default engine: pick the right option for the blank in a sentence. Questions come
// from the `quiz` array of the data file named by `source` in quizzes.json.
// `count` applies only when another engine uses this one internally or when def.count is
// set; ordinary quizzes stay at the default of 10 questions.
function FillBlankQuiz({ def, embedded = false, count = def.count ?? QUESTION_COUNT }: QuizEngineProps & { count?: number }) {
  const run = useQuizRun<Question, string>(() => buildQuestions(quizItems(def), count))

  if (run.finished) {
    return (
      <QuizResult
        embedded={embedded}
        score={run.score}
        total={run.total}
        lessonPath={def.lessonPath}
        onRestart={run.restart}
      />
    )
  }

  const question = run.question
  const fullSentence = fillSentence(question.sentence, question.correct)

  return (
    <QuizShell
      title={def.title}
      embedded={embedded}
      current={run.current}
      total={run.total}
      score={run.score}
    >
      <p className="mt-6 text-lg italic">{question.sentence}</p>
      <p className="mt-1 text-sm text-gray-500">{gloss(question)}</p>

      <OptionGrid
        options={question.options}
        correct={question.correct}
        selected={run.answer}
        onSelect={(option) => run.submit(option, option === question.correct)}
      />

      {run.answered && (
        <>
          <NextButton isLast={run.isLast} onClick={run.next} className="mt-4" />
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

export default FillBlankQuiz
