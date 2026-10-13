import { Link } from 'react-router'
import { lessonPosition } from '../lib/lessonOrder'
import { t } from '../i18n'

// Previous / next lesson pair at the end of a lesson. The next lesson is the primary
// action, so it takes the accent; the previous one stays neutral.
function LessonNav({ slug }: { slug: string }) {
  const pos = lessonPosition(slug)
  if (!pos || (!pos.prev && !pos.next)) return null
  return (
    <nav aria-label={t.lesson.nav} className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
      {pos.prev ? (
        <Link
          to={`/dersler/${pos.prev.slug}`}
          className="group flex flex-col rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-brand-400 hover:shadow-sm"
        >
          <span className="text-xs font-medium text-gray-400">{t.lesson.prev}</span>
          <span className="mt-0.5 text-sm font-semibold text-gray-700 group-hover:text-brand-700">
            {pos.prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {pos.next && (
        <Link
          to={`/dersler/${pos.next.slug}`}
          className="group flex flex-col rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-right transition hover:border-brand-500 hover:bg-brand-100 hover:shadow-sm"
        >
          <span className="text-xs font-medium text-brand-700/70">{t.lesson.next}</span>
          <span className="mt-0.5 text-sm font-semibold text-brand-800">{pos.next.title}</span>
        </Link>
      )}
    </nav>
  )
}

export default LessonNav
