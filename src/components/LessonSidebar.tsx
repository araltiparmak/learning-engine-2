import { useEffect, useState } from 'react'
import type { ContentsEntry } from './LessonRenderer'
import { t } from '../i18n'

// The lesson's contents as a sticky left column on wide screens (lg+). Below that the
// renderer's own contents box shows instead. The section being read is marked: the
// last heading that has scrolled past the top quarter of the screen.
function LessonSidebar({ contents }: { contents: ContentsEntry[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    function update() {
      const line = window.innerHeight * 0.25
      let current: string | null = null
      for (const c of contents) {
        const el = document.getElementById(c.id)
        if (el && el.getBoundingClientRect().top <= line) current = c.id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [contents])

  return (
    <nav
      aria-label={t.lesson.contents}
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 [scrollbar-width:thin]"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t.lesson.inThisLesson}
      </p>
      <ol className="mt-3 border-l border-gray-200 text-sm">
        {contents.map((c) => {
          const on = c.id === active
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={on ? 'location' : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3 leading-snug transition ${
                  on
                    ? 'border-accent-500 font-semibold text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {c.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default LessonSidebar
