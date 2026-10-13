import { Link } from 'react-router'
import config from '../config'
import { generalQuizzes, quizPoolSize, quizzesForLesson, type QuizDef } from '../data/quizzes'
import { t } from '../i18n'

// The Quiz tab: quizzes are listed under the lesson they belong to, in lesson order.
// The level badge is read from the lesson (quizzes.json stores no level), so the list
// groups itself correctly once B1 lessons arrive.
const lessons = config.lessonsList.flatMap((section) => section.lessons)

// General quizzes with no lesson sit at the top of the list, in their own section.
const general = generalQuizzes()

function QuizCard({ def }: { def: QuizDef }) {
  // Only the fillBlank engine has a single question pool (other engines read their own
  // source group); the pool badge only makes sense there.
  const poolSize = quizPoolSize(def)
  return (
    <li>
      <Link
        to={`/quiz/${def.slug}`}
        className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-sm"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">{def.listTitle}</h2>
          {poolSize > 0 && <span className="shrink-0 text-xs text-gray-400">{t.quiz.pool(poolSize)}</span>}
        </div>
        <p className="mt-1 text-gray-600">{def.description}</p>
      </Link>
    </li>
  )
}

function Quiz() {
  const groups = lessons
    .map((lesson) => ({ lesson, quizzes: quizzesForLesson(lesson.slug) }))
    .filter((g) => g.quizzes.length > 0)

  return (
    <section>
      <h1 className="text-3xl font-bold">{t.quiz.title}</h1>
      <p className="mt-2 text-gray-600">{t.quiz.intro}</p>
      {general.length > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-brand-700">{t.quiz.general}</span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {t.quiz.allTopics}
            </span>
          </div>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {general.map((quiz) => (
              <QuizCard key={quiz.slug} def={quiz} />
            ))}
          </ul>
        </div>
      )}
      {groups.length === 0 && general.length === 0 && (
        <p className="mt-6 text-gray-600">{t.quiz.none}</p>
      )}
      <div className="mt-6 space-y-8">
        {groups.map(({ lesson, quizzes }) => (
          <div key={lesson.slug}>
            <div className="flex items-baseline gap-2">
              <Link
                to={`/dersler/${lesson.slug}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                {lesson.title}
              </Link>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {lesson.level}
              </span>
            </div>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.slug} def={quiz} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Quiz
