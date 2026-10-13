import { shuffle } from '../../lib/shuffle'
import TipBox from '../TipBox'
import { NextButton, OptionGrid, QuizResult, QuizShell, type QuizEngineProps } from './QuizFrame'
import { useQuizRun } from './useQuizRun'
import {
  answerOf,
  fill,
  formItems,
  formSettings,
  questionCount,
  rowText,
  tipOf,
  type FormItem,
  type FormQuizSettings,
} from './formQuiz'

// Pick the right answer for a row (see ./formQuiz.ts for the settings). Two kinds:
//   - fixed options (`choice.options`), the answer being the row's group's — "haben or
//     sein?", each option labelled through `choice.optionLabels` ("hat {partizip}");
//   - generated options: the right form, the row's `wrong` forms from the settings (the
//     mistakes learners typically make, ör. trinken → "getrinkt") and other rows' answers
//     as fillers.
type Question = { item: FormItem; options: string[] }

function distractorsFor(item: FormItem, source: string, settings: FormQuizSettings): string[] {
  const correct = answerOf(item, settings)
  const plausible = settings.wrong?.[rowText(item, settings.prompt)] ?? []
  const fillers = shuffle(formItems(source, settings))
    .map((other) => rowText(other, settings.answer))
    .filter((form) => form !== correct && !plausible.includes(form))
  return shuffle(plausible).concat(fillers).slice(0, 3)
}

function buildQuestions(source: string, settings: FormQuizSettings): Question[] {
  const fixed = settings.choice?.options
  return shuffle(formItems(source, settings))
    .slice(0, questionCount(settings))
    .map((item) => ({
      item,
      options: fixed ?? shuffle([answerOf(item, settings), ...distractorsFor(item, source, settings)]),
    }))
}

function FormChoiceQuiz({ def, embedded = false }: QuizEngineProps) {
  const settings = formSettings(def.source)
  const run = useQuizRun<Question, string>(() => buildQuestions(def.source, settings))

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

  const { item, options } = run.question
  const correct = answerOf(item, settings)
  const labels = settings.choice?.optionLabels

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
        {settings.choice?.question}
      </p>

      <OptionGrid
        layout="stack"
        options={options}
        correct={correct}
        selected={run.answer}
        onSelect={(option) => run.submit(option, option === correct)}
        label={labels && ((option) => fill(labels[option] ?? option, item.row))}
      />

      {run.answered && (
        <>
          <TipBox>{tipOf(item, settings)}</TipBox>
          <NextButton isLast={run.isLast} onClick={run.next} />
        </>
      )}
    </QuizShell>
  )
}

export default FormChoiceQuiz
