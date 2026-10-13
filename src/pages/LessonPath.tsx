import { useState } from 'react'
import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import config, { type Lesson } from '../config'
import { lessonMinutes } from '../data/lessons'
import { useFavoriteLessons } from '../lib/favorites'
import {
  pathIntro,
  pathLessons,
  pathSteps,
  paths,
  stepHref,
  stepKind,
  type LessonPath,
  type PathStep,
  type StepKind,
} from '../lib/lessonPath'
import { MASTERED_STAGE, STAGE_LABELS, readStages } from '../lib/review'
import { slugify } from '../lib/slugify'
import { readStoredList, writeStoredList } from '../lib/storage'
import { toggled } from '../lib/sets'
import { t } from '../i18n'

// Titles come from the lesson list, so they are written once, in list.json.
const lessonsBySlug = new Map(
  config.lessonsList.flatMap((s) => s.lessons.map((l) => [l.slug, l] as const)),
)

if (import.meta.env.DEV) {
  for (const path of paths)
    for (const step of pathSteps(path))
      for (const slug of [...(stepKind(step) === 'grammar' && step.slug ? [step.slug] : []), ...(step.requires ?? [])])
        if (!lessonsBySlug.has(slug)) console.warn(`lessonPath: "${path.id}" names unknown lesson ${slug}`)
}

// Lessons the path does not place, grouped as in list.json. Computed rather than listed,
// so a lesson added to list.json shows up here until someone gives it a step.
const inPath = new Set(paths.flatMap((p) => pathLessons(p).map((s) => s.slug)))
const extraGroups = config.lessonsList
  .map((section, i) => ({
    id: slugify(section.title) || `grup-${i}`,
    title: section.title,
    note: section.note,
    lessons: section.lessons.filter((l) => !inPath.has(l.slug)),
  }))
  .filter((g) => g.lessons.length > 0)

const FAV_ID = 'favoriler'

const kindBadge: Record<StepKind, string> = {
  grammar: 'bg-brand-50 text-brand-700',
  reading: 'bg-amber-50 text-amber-800',
  listening: 'bg-sky-50 text-sky-800',
}
const kindCard: Record<StepKind, string> = {
  grammar: 'border-gray-200 bg-white',
  reading: 'border-amber-200 bg-amber-50/40',
  listening: 'border-sky-200 bg-sky-50/40',
}

/** Which groups are hidden is a per-viewer convenience; storage may be unavailable. */
const HIDDEN_KEY = 'dersYoluGizli'

/** Learned state and favourites, read once per render of the page. */
type Progress = {
  stageOf: (slug: string) => number | null
  favorites: Set<string>
  toggleFavorite: (slug: string) => void
}

function StageBadge({ stage }: { stage: number }) {
  const mastered = stage >= MASTERED_STAGE
  return (
    <span
      title={STAGE_LABELS[Math.min(stage, MASTERED_STAGE)]}
      className={`rounded-full px-2 py-0.5 ${mastered ? 'bg-green-100 text-green-700' : 'bg-brand-50 text-brand-700'}`}
    >
      {mastered ? t.review.masteredBadge : t.review.studiedBadge(stage + 1)}
    </span>
  )
}

function StepCard({
  step,
  number,
  next = false,
  lesson,
  progress,
}: {
  step: PathStep
  /** Position in the whole level, so the order reads across sections; absent off the path. */
  number?: number
  /** The first lesson of the level not learned yet. */
  next?: boolean
  /** A lesson off the path: shown with its list description and level, without a type badge. */
  lesson?: Lesson
  progress: Progress
}) {
  const kind = stepKind(step)
  const href = stepHref(step)
  const isLesson = kind === 'grammar' && !!step.slug
  const stage = isLesson ? progress.stageOf(step.slug!) : null
  const done = stage !== null
  const favorite = isLesson && progress.favorites.has(step.slug!)
  const mins = isLesson ? lessonMinutes(step.slug!) : step.minutes
  const title = isLesson ? (lessonsBySlug.get(step.slug!)?.title ?? step.slug) : step.title
  const body = lesson ? lesson.description : kind === 'grammar' ? step.why : step.focus
  return (
    // The title link stretches over the whole card; the star sits above it.
    <li
      className={`group relative flex flex-col rounded-xl border p-4 transition ${
        href ? 'hover:border-brand-400 hover:shadow-md' : 'border-dashed'
      } ${next ? 'border-brand-400 bg-white' : done ? 'border-gray-200 bg-gray-50/70' : kindCard[kind]}`}
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-7 text-xs">
        {number !== undefined && <span className="font-semibold text-gray-400">{t.path.step(number)}</span>}
        {lesson ? (
          <span className="rounded-full bg-accent-100 px-2 py-0.5 font-medium text-accent-700">{lesson.level}</span>
        ) : (
          <span className={`rounded-full px-2 py-0.5 font-medium ${kindBadge[kind]}`}>{t.path.kinds[kind]}</span>
        )}
        {mins && <span className="text-gray-400">{t.lesson.minutes(mins)}</span>}
        {done && <StageBadge stage={stage} />}
        {next && <span className="rounded-full bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">{t.path.next}</span>}
        {!href && <span className="font-semibold text-gray-400">{t.path.soon}</span>}
      </p>
      {isLesson && (
        <button
          type="button"
          onClick={() => progress.toggleFavorite(step.slug!)}
          aria-pressed={favorite}
          aria-label={favorite ? t.lessons.removeFavorite : t.lessons.addFavorite}
          title={favorite ? t.lessons.removeFavorite : t.lessons.addFavorite}
          className={`absolute right-2 top-2 z-10 rounded-full p-1.5 text-base leading-none transition hover:bg-accent-50 ${
            favorite ? 'text-accent-500' : 'text-gray-300 hover:text-accent-400'
          }`}
        >
          {favorite ? '★' : '☆'}
        </button>
      )}
      <h4 className={`mt-1.5 font-semibold leading-snug ${done ? 'text-gray-500' : ''} ${href ? 'group-hover:text-brand-700' : ''}`}>
        {href ? (
          <Link to={href} className="after:absolute after:inset-0 after:rounded-xl">
            {title}
          </Link>
        ) : (
          title
        )}
      </h4>
      {body && <p className={`mt-1 line-clamp-3 text-sm ${done ? 'text-gray-400' : 'text-gray-600'}`}>{body}</p>}
      {step.note && <p className="mt-2 text-xs text-accent-700">{step.note}</p>}
    </li>
  )
}

function Panel({
  badge,
  title,
  done,
  total,
  children,
}: {
  badge?: string
  title: string
  done: number
  total: number
  children: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white/60">
      <h2 className="flex items-center gap-3 px-4 py-3">
        {badge && <span className="rounded-lg bg-brand-600 px-2.5 py-1 text-sm font-bold text-white">{badge}</span>}
        <span className="min-w-0 flex-1">
          {/* The badge already names the level; a title only earns a line when it says more. */}
          {title !== badge && <span className="block font-semibold">{title}</span>}
          <span className="block text-xs font-normal text-gray-500">{t.path.progress(done, total)}</span>
        </span>
      </h2>
      {children}
    </div>
  )
}

function LevelPath({ path, progress }: { path: LessonPath; progress: Progress }) {
  const lessons = pathLessons(path)
  const learned = (slug: string) => progress.stageOf(slug) !== null
  const doneCount = lessons.filter((s) => learned(s.slug!)).length
  const nextSlug = lessons.find((s) => !learned(s.slug!))?.slug
  // Running step number across sections.
  let number = 0
  return (
    <Panel badge={path.level} title={path.title} done={doneCount} total={lessons.length}>
      <ol className="px-4 pt-2 pb-5">
        {path.sections.map((section, i) => {
          const sectionLessons = section.steps.filter((s) => stepKind(s) === 'grammar' && s.slug)
          const done = sectionLessons.length > 0 && sectionLessons.every((s) => learned(s.slug!))
          const last = i === path.sections.length - 1
          return (
            <li key={i} className="relative flex gap-3 pb-8 last:pb-0 sm:gap-4">
              {/* The rail between sections; green once the section above it is done. */}
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-4 top-9 bottom-0 w-0.5 -translate-x-1/2 ${done ? 'bg-green-600' : 'bg-gray-200'}`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done ? 'border-green-600 bg-green-600 text-white' : 'border-brand-600 bg-white text-brand-700'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                {section.title && <p className="pt-1 text-sm font-semibold text-gray-700">{section.title}</p>}
                {section.note && <p className="mt-1 max-w-2xl text-xs text-gray-500">{section.note}</p>}
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.steps.map((step, j) => (
                    <StepCard
                      key={step.slug ?? `${i}-${j}`}
                      step={step}
                      number={++number}
                      next={!!step.slug && stepKind(step) === 'grammar' && step.slug === nextSlug}
                      progress={progress}
                    />
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

/** Lessons without a place on the path, as plain cards. */
function LessonGroup({
  title,
  note,
  lessons,
  progress,
}: {
  title: string
  note?: string
  lessons: Lesson[]
  progress: Progress
}) {
  const done = lessons.filter((l) => progress.stageOf(l.slug) !== null).length
  return (
    <Panel title={title} done={done} total={lessons.length}>
      <div className="px-4 pt-1 pb-5">
        {note && <p className="mb-3 max-w-2xl text-xs text-gray-500">{note}</p>}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l) => (
            <StepCard key={l.slug} step={{ slug: l.slug }} lesson={l} progress={progress} />
          ))}
        </ul>
      </div>
    </Panel>
  )
}

function LessonPathPage() {
  const { favorites, toggleFavorite } = useFavoriteLessons()
  const progress: Progress = { stageOf: readStages(), favorites, toggleFavorite }
  const favoriteLessons = [...lessonsBySlug.values()].filter((l) => favorites.has(l.slug))

  const [hidden, setHidden] = useState(() => new Set(readStoredList<string>(HIDDEN_KEY)))
  const toggle = (id: string) => {
    const next = toggled(hidden, id)
    writeStoredList(HIDDEN_KEY, next)
    setHidden(next)
  }
  const filters = [
    ...(favoriteLessons.length > 0 ? [{ id: FAV_ID, label: t.lessons.favTab }] : []),
    ...paths.map((p) => ({ id: p.id, label: p.level })),
    ...extraGroups.map((g) => ({ id: g.id, label: g.title })),
  ]
  const shown = (id: string) => !hidden.has(id)

  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">{t.path.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">{pathIntro}</p>
        </div>
      </div>

      <fieldset className="mt-6 flex flex-wrap items-center gap-2">
        <legend className="sr-only">{t.path.show}</legend>
        <span aria-hidden className="mr-1 text-sm text-gray-500">
          {t.path.show}
        </span>
        {filters.map((f) => (
          <label
            key={f.id}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-300 ${
              shown(f.id)
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400'
            }`}
          >
            <input
              type="checkbox"
              checked={shown(f.id)}
              onChange={() => toggle(f.id)}
              className="h-4 w-4 cursor-pointer accent-brand-600"
            />
            {f.label}
          </label>
        ))}
      </fieldset>

      {favoriteLessons.length > 0 && shown(FAV_ID) && (
        <LessonGroup title={t.lessons.favTab} note={t.lessons.favNote} lessons={favoriteLessons} progress={progress} />
      )}
      {paths.filter((p) => shown(p.id)).map((path) => (
        <LevelPath key={path.id} path={path} progress={progress} />
      ))}
      {extraGroups.filter((g) => shown(g.id)).map((g) => (
        <LessonGroup key={g.id} title={g.title} note={g.note} lessons={g.lessons} progress={progress} />
      ))}
    </section>
  )
}

export default LessonPathPage
