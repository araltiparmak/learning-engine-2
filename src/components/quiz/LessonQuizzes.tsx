import { quizzesForLesson } from '../../data/quizzes'
import QuizView from './QuizView'
import { t } from '../../i18n'

// The quiz section under a lesson. Which quizzes appear is not written in the lesson
// JSON but in the `lesson` field of quizzes.json — lesson and quiz are matched in one place.
function LessonQuizzes({ slug }: { slug: string }) {
  const list = quizzesForLesson(slug)
  if (list.length === 0) return null
  return (
    <section id="kendini-test-et" className="mt-10 max-w-3xl scroll-mt-20">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
        🎯 {t.lesson.testYourself}
      </h2>
      <div className="mt-3 space-y-6">
        {list.map((def) => (
          <div key={def.slug} className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
            <QuizView def={def} embedded />
          </div>
        ))}
      </div>
    </section>
  )
}

export default LessonQuizzes
