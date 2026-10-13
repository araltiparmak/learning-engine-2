import Mascot from './Mascot'
import LearnedToggle from './LearnedToggle'
import LessonFavorite from './LessonFavorite'
import { t } from '../i18n'

// The closing card of a lesson: one place for everything the learner does when they are
// done — marking how many times it was studied (drives the review reminders) and
// starring the lesson. Keeping both in one framed card gives the page a visible end
// instead of loose buttons trailing after the writing section.
function LessonFinish({ slug }: { slug: string }) {
  return (
    <section className="mt-10 max-w-3xl rounded-xl border border-brand-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Mascot mood="celebrate" className="w-12 shrink-0" />
        <div>
          <h2 className="font-semibold text-gray-900">{t.lesson.finishTitle}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{t.lesson.finishNote}</p>
        </div>
      </div>
      <LearnedToggle key={slug} slug={slug} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500">{t.lesson.favoriteQuestion}</p>
        <LessonFavorite key={`fav-${slug}`} slug={slug} />
      </div>
    </section>
  )
}

export default LessonFinish
