import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { lessonPosition, sectionLessons } from '../lib/lessonOrder'
import { learnedLessons } from '../lib/review'
import { t } from '../i18n'

// The far-left column of a lesson page on very wide screens: every lesson of the
// section this one is listed under, so the reader can move along the course without
// going back to /dersler. Learned lessons get a tick; the open one is marked.
function LessonCourseNav({ slug }: { slug: string }) {
  const pos = lessonPosition(slug)
  const lessons = sectionLessons(slug)
  const navRef = useRef<HTMLElement>(null)

  // A long section scrolls inside the column: bring the open lesson into view there,
  // moving only the column, not the page.
  useEffect(() => {
    const nav = navRef.current
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (nav && current) nav.scrollTop = current.offsetTop - nav.clientHeight / 3
  }, [slug])

  if (!pos || lessons.length === 0) return null
  const learned = learnedLessons()

  return (
    <nav
      ref={navRef}
      aria-label={t.lesson.sectionLessons}
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 [scrollbar-width:thin]"
    >
      <Link
        to="/dersler"
        className="text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-brand-700"
      >
        {pos.section}
      </Link>
      <ol className="mt-3 space-y-0.5 text-sm">
        {lessons.map((l, i) => {
          const on = l.slug === slug
          const done = learned.has(l.slug)
          return (
            <li key={l.slug}>
              <Link
                to={`/dersler/${l.slug}`}
                aria-current={on ? 'page' : undefined}
                className={`flex gap-2 rounded-md px-2 py-1.5 leading-snug transition ${
                  on
                    ? 'bg-white font-semibold text-gray-900 shadow-[inset_3px_0_0_var(--accent-500)]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span
                  className={`w-4 shrink-0 text-right tabular-nums ${done ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className="min-w-0">{l.title}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default LessonCourseNav
