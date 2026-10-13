import { sourceField, sourceRows } from '../../data/sources'
import Reveal from '../Reveal'
import { BackLink } from '../DetailPage'
import { t } from '../../i18n'
import LessonReview from '../LessonReview'
import FillBlankQuiz from './FillBlankQuiz'
import SentenceOrderQuiz from './SentenceOrderQuiz'
import type { QuizEngineProps } from './QuizFrame'
import type { FillBlankItem } from '../../data/quizzes'
import type { Review } from '../LessonRenderer'

// A single-page revision package: reveal exercises, a fillBlank quiz and sentence
// building follow one another, all fed by ONE source file (`def.source`) — its
// `exercises`, `quiz` and `satzbau` arrays plus an optional `review` box. Deliberately
// NOT a lesson: it never appears under Lessons, only on the Quiz tab as one card/page.
// Section titles and question counts are optional in the source file, so a new package
// (another chapter, another language) is JSON only:
//   "package": { "quizTitle": "…", "quizCount": 25, "satzbauTitle": "…", "satzbauCount": 10 }
type PackageOptions = {
  exercisesTitle?: string
  quizTitle?: string
  quizCount?: number
  satzbauTitle?: string
  satzbauCount?: number
}

function ReviewPackageQuiz({ def, embedded = false }: QuizEngineProps) {
  const options = sourceField<PackageOptions>(def.source, 'package') ?? {}
  const exercises = sourceRows<{ q: string; a: string }>(def.source, 'exercises')
  const quizItems = sourceRows<FillBlankItem>(def.source, 'quiz')
  const review = sourceField<Review>(def.source, 'review')

  return (
    <section className={embedded ? undefined : 'max-w-2xl'}>
      {!embedded && <BackLink to="/quiz">{t.quiz.backToList}</BackLink>}
      <h1 className={`font-bold ${embedded ? 'text-xl' : 'mt-2 text-2xl sm:text-3xl'}`}>{def.title}</h1>
      <p className="mt-2 text-gray-600">{def.description}</p>

      {exercises.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold">{options.exercisesTitle ?? 'Alıştırma'}</h2>
          <Reveal items={exercises} />
        </>
      )}

      {quizItems.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold">Quiz</h2>
          <FillBlankQuiz
            def={{ ...def, title: options.quizTitle ?? 'Quiz', items: quizItems }}
            embedded
            count={options.quizCount ?? 25}
          />
        </>
      )}

      {sourceRows(def.source, 'satzbau').length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold">Cümle kurma</h2>
          <SentenceOrderQuiz
            def={{ ...def, title: options.satzbauTitle ?? 'Cümle kur', count: options.satzbauCount ?? 10 }}
            embedded
          />
        </>
      )}

      <LessonReview review={review} />
    </section>
  )
}

export default ReviewPackageQuiz
