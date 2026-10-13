import config, { type Lesson } from '../config'

// Lesson order comes from a single source: the active language's lesson list.
export type OrderedLesson = Pick<Lesson, 'slug' | 'title' | 'level'>

type Entry = OrderedLesson & { section: string; indexInSection: number; sectionSize: number }

const order: Entry[] = config.lessonsList.flatMap((s) =>
  s.lessons.map((l, i) => ({
    slug: l.slug,
    title: l.title,
    level: l.level,
    section: s.title,
    indexInSection: i + 1,
    sectionSize: s.lessons.length,
  })),
)

export type LessonPosition = {
  /** Title of the section (tab) the lesson is listed under. */
  section: string
  /** 1-based position inside that section, and the section's size. */
  index: number
  total: number
  prev: OrderedLesson | null
  next: OrderedLesson | null
}

/** Where a lesson sits in the course; null for slugs not in the list (speaking docs…). */
export function lessonPosition(slug: string): LessonPosition | null {
  const i = order.findIndex((l) => l.slug === slug)
  if (i < 0) return null
  const entry = order[i]
  return {
    section: entry.section,
    index: entry.indexInSection,
    total: entry.sectionSize,
    prev: i > 0 ? order[i - 1] : null,
    next: i < order.length - 1 ? order[i + 1] : null,
  }
}

/** The lessons of the section a lesson belongs to, in course order; [] for unlisted slugs. */
export function sectionLessons(slug: string): OrderedLesson[] {
  const entry = order.find((l) => l.slug === slug)
  if (!entry) return []
  return order
    .filter((l) => l.section === entry.section)
    .map(({ slug, title, level }) => ({ slug, title, level }))
}
