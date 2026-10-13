import { useState } from 'react'
import { Link } from 'react-router'
import config from '../config'
import { pendingLessons, markReviewed, STAGE_LABELS } from '../lib/review'
import { t } from '../i18n'

const titles = new Map(
  config.lessonsList.flatMap((section) => section.lessons).map((l) => [l.slug, l.title]),
)

// Only lessons in the reader's list: a lesson marked while reading in Turkish has no
// title (or page) for an English reader.
const listedPending = () => pendingLessons().filter((l) => titles.has(l.slug))

// Lists the lessons that are not fully learned yet on the home page — a stage marked on
// a lesson page or in the /dersler list shows up here at the same moment. Renders
// nothing when there are none.
function ReviewReminder() {
  const [pending, setPending] = useState(listedPending)

  if (pending.length === 0) return null

  const confirm = (slug: string) => {
    markReviewed(slug)
    setPending(listedPending())
  }

  return (
    <section className="mt-12 rounded-lg border border-brand-300 bg-white p-5">
      <h2 className="text-xl font-bold">
        <span aria-hidden="true" className="mr-1.5">
          🔔
        </span>
        {t.review.pendingTitle}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{t.review.pendingIntro(pending.length)}</p>

      <ul className="mt-4 space-y-2">
        {pending.map((lesson) => (
          <li
            key={lesson.slug}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-100 pt-2"
          >
            <Link
              to={`/dersler/${lesson.slug}`}
              className="font-medium text-brand-700 hover:underline"
            >
              {titles.get(lesson.slug)}
            </Link>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {STAGE_LABELS[lesson.stage]}
            </span>
            <span className="text-xs text-gray-400">{t.review.daysAtStage(lesson.daysSince)}</span>
            <button
              type="button"
              onClick={() => confirm(lesson.slug)}
              className="ml-auto rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:border-brand-400 hover:text-brand-700"
            >
              {t.review.reviewed}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ReviewReminder
