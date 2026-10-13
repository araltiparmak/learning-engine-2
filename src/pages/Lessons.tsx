import { useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import config, { type Lesson } from '../config'
import { lessonMinutes } from '../data/lessons'
import { STAGE_LABELS, MASTERED_STAGE, learnedLessons, readStages } from '../lib/review'
import { useFavoriteLessons } from '../lib/favorites'
import { slugify } from '../lib/slugify'
import { t } from '../i18n'

const sections = config.lessonsList

/** Which tab is open lives in the URL, so a tab can be linked and survives a reload. */
const TAB_PARAM = 'bolum'
const DONE_TAB = 'ogrendiklerim'
const FAV_TAB = 'favorilerim'

/** Short form of the review label for the card badge; the full label is the title text. */
function stageBadge(stage: number): string {
  return stage >= MASTERED_STAGE ? t.review.masteredBadge : t.review.studiedBadge(stage + 1)
}

// One card definition for every tab, so learning a lesson never changes how its card
// LOOKS — only whether it is dimmed and which tab it also appears under.
function LessonCard({
  lesson,
  showLevel,
  stage,
  favorite,
  onToggleFavorite,
}: {
  lesson: Lesson
  /** Only worth the pixels when the section mixes levels; a pure A2 tab repeats itself. */
  showLevel: boolean
  /** Review stage of a learned lesson, or null when it is still unlearned. */
  stage: number | null
  favorite: boolean
  onToggleFavorite: (slug: string) => void
}) {
  // The same build-time figure the lesson page shows, so the two numbers never disagree.
  const mins = lessonMinutes(lesson.slug)
  const done = stage !== null
  return (
    // The star is a sibling of the link, not a child: a <button> inside an <a> is invalid
    // HTML and swallows the card's own click target.
    <li className="relative">
      <button
        type="button"
        onClick={() => onToggleFavorite(lesson.slug)}
        aria-pressed={favorite}
        aria-label={favorite ? t.lessons.removeFavorite : t.lessons.addFavorite}
        title={favorite ? t.lessons.removeFavorite : t.lessons.addFavorite}
        className={`absolute right-2 top-2 z-10 rounded-full p-1.5 text-base leading-none transition hover:bg-accent-50 ${
          favorite ? 'text-accent-500' : 'text-gray-300 hover:text-accent-400'
        }`}
      >
        {favorite ? '★' : '☆'}
      </button>
      <Link
        to={`/dersler/${lesson.slug}`}
        className={`group flex h-full flex-col rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md ${
          done ? 'border-gray-200 bg-gray-50/70' : 'border-gray-200 bg-white'
        }`}
      >
        <h3
          className={`pr-8 text-base font-semibold leading-snug group-hover:text-brand-700 ${
            done ? 'text-gray-500' : ''
          }`}
        >
          {lesson.title}
        </h3>
        <p className={`mt-1.5 line-clamp-3 text-sm ${done ? 'text-gray-400' : 'text-gray-600'}`}>
          {lesson.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-xs text-gray-400">
          {showLevel && (
            <span className="rounded-full bg-accent-100 px-2 py-0.5 font-medium text-accent-700">
              {lesson.level}
            </span>
          )}
          {mins && <span>{t.lesson.minutes(mins)}</span>}
          {done && (
            <span
              title={STAGE_LABELS[Math.min(stage, MASTERED_STAGE)]}
              className={`rounded-full px-2 py-0.5 font-medium ${
                stage >= MASTERED_STAGE
                  ? 'bg-green-100 text-green-700'
                  : 'bg-brand-50 text-brand-700'
              }`}
            >
              {stageBadge(stage)}
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}

function CardGrid({
  items,
  showLevel,
  stageOf,
  favorites,
  onToggleFavorite,
}: {
  items: Lesson[]
  showLevel: boolean
  stageOf: (slug: string) => number | null
  favorites: Set<string>
  onToggleFavorite: (slug: string) => void
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {items.map((lesson) => (
        <LessonCard
          key={lesson.slug}
          lesson={lesson}
          showLevel={showLevel}
          stage={stageOf(lesson.slug)}
          favorite={favorites.has(lesson.slug)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  )
}

function Lessons() {
  const [params, setParams] = useSearchParams()
  const tablist = useRef<HTMLDivElement>(null)

  const learned = learnedLessons()
  const stageOf = readStages()
  // The only cookie the page WRITES, so it is the only one held in state.
  const { favorites, toggleFavorite } = useFavoriteLessons()

  // Tabs mirror the sections in list.json, in data order — no level is hard-coded, so a
  // new B1/C1 section becomes a tab by itself.
  const tabs = useMemo(
    () =>
      sections.map((section, i) => ({
        id: slugify(section.title) || `bolum-${i}`,
        section,
        // A shown level badge only earns its place in a section that mixes levels.
        mixedLevels: new Set(section.lessons.map((l) => l.level)).size > 1,
      })),
    [],
  )

  const all = sections.flatMap((s) => s.lessons)
  const doneCount = all.filter((l) => learned.has(l.slug)).length

  // Learned lessons are bucketed by review stage: those awaiting their 1st/2nd/3rd
  // review come first, and the fully learned ones stay pinned at the bottom.
  const doneBuckets: Lesson[][] = STAGE_LABELS.map(() => [])
  for (const lesson of all.filter((l) => learned.has(l.slug))) {
    doneBuckets[Math.min(stageOf(lesson.slug) ?? 0, MASTERED_STAGE)].push(lesson)
  }

  const favoriteLessons = all.filter((l) => favorites.has(l.slug))

  const ids = [
    ...tabs.map((t) => t.id),
    ...(favoriteLessons.length > 0 ? [FAV_TAB] : []),
    ...(doneCount > 0 ? [DONE_TAB] : []),
  ]
  const fallback = tabs.find((t) => t.section.openByDefault)?.id ?? ids[0]
  const requested = params.get(TAB_PARAM)
  const active = requested && ids.includes(requested) ? requested : fallback

  function select(id: string) {
    const next = new URLSearchParams(params)
    next.set(TAB_PARAM, id)
    setParams(next, { replace: true })
  }

  // Arrow keys move between tabs, as a tablist is expected to.
  function onKeyDown(e: React.KeyboardEvent) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    let target: string | undefined
    if (delta) target = ids[(ids.indexOf(active) + delta + ids.length) % ids.length]
    else if (e.key === 'Home') target = ids[0]
    else if (e.key === 'End') target = ids[ids.length - 1]
    if (!target) return
    e.preventDefault()
    select(target)
    tablist.current?.querySelector<HTMLElement>(`#tab-${target}`)?.focus()
  }

  const openTab = tabs.find((t) => t.id === active)
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0

  return (
    <section>
      <h1 className="text-3xl font-bold">{t.lessons.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
        <span>
          {t.lessons.progress(
            all.length,
            <strong className="font-semibold text-gray-900">{doneCount}</strong>,
          )}
        </span>
        <span className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
          <span className="block h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
        </span>
        <span className="text-gray-400">{t.lessons.percent(pct)}</span>
      </div>

      {/* Sticky under the 56px header so the tabs stay reachable while a long tab scrolls. */}
      <div className="sticky top-14 z-30 -mx-4 mt-5 border-b border-gray-200 bg-gray-50/95 px-4 backdrop-blur">
        <div
          ref={tablist}
          role="tablist"
          aria-label={t.lessons.sections}
          onKeyDown={onKeyDown}
          className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const done = tab.section.lessons.filter((l) => learned.has(l.slug)).length
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={active === tab.id}
                aria-controls="ders-panel"
                tabIndex={active === tab.id ? 0 : -1}
                onClick={() => select(tab.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
                  active === tab.id
                    ? 'bg-brand-600 font-semibold text-white'
                    : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                {tab.section.title}
                <span
                  className={`ml-1.5 text-xs ${
                    active === tab.id ? 'text-brand-100' : 'text-gray-400'
                  }`}
                >
                  {done > 0 ? `${done}/${tab.section.lessons.length}` : tab.section.lessons.length}
                </span>
              </button>
            )
          })}
          {favoriteLessons.length > 0 && (
            <button
              id={`tab-${FAV_TAB}`}
              role="tab"
              aria-selected={active === FAV_TAB}
              aria-controls="ders-panel"
              tabIndex={active === FAV_TAB ? 0 : -1}
              onClick={() => select(FAV_TAB)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
                active === FAV_TAB
                  ? 'bg-brand-600 font-semibold text-white'
                  : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
              }`}
            >
              {t.lessons.favTab}
              <span
                className={`ml-1.5 text-xs ${
                  active === FAV_TAB ? 'text-brand-100' : 'text-gray-400'
                }`}
              >
                {favoriteLessons.length}
              </span>
            </button>
          )}
          {doneCount > 0 && (
            <button
              id={`tab-${DONE_TAB}`}
              role="tab"
              aria-selected={active === DONE_TAB}
              aria-controls="ders-panel"
              tabIndex={active === DONE_TAB ? 0 : -1}
              onClick={() => select(DONE_TAB)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
                active === DONE_TAB
                  ? 'bg-green-700 font-semibold text-white'
                  : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
              }`}
            >
              {t.lessons.doneTab}
              <span
                className={`ml-1.5 text-xs ${
                  active === DONE_TAB ? 'text-green-100' : 'text-gray-400'
                }`}
              >
                {doneCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <div id="ders-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-6">
        {openTab && (
          <>
            {openTab.section.note && (
              <p className="mb-4 max-w-2xl text-sm text-gray-500">{openTab.section.note}</p>
            )}
            <CardGrid
              items={openTab.section.lessons}
              showLevel={openTab.mixedLevels}
              stageOf={stageOf}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {active === FAV_TAB && (
          <>
            <p className="mb-4 max-w-2xl text-sm text-gray-500">{t.lessons.favNote}</p>
            <CardGrid
              items={favoriteLessons}
              showLevel
              stageOf={stageOf}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}

        {active === DONE_TAB && (
          <>
            <p className="mb-4 max-w-2xl text-sm text-gray-500">{t.lessons.doneNote(doneCount)}</p>
            {doneBuckets.map((bucket, i) =>
              bucket.length === 0 ? null : (
                <div key={STAGE_LABELS[i]} className="mb-8">
                  <h2
                    className={`mb-3 text-sm font-semibold uppercase tracking-wide ${
                      i === MASTERED_STAGE ? 'text-green-700' : 'text-brand-700'
                    }`}
                  >
                    {STAGE_LABELS[i]} <span className="text-gray-400">({bucket.length})</span>
                  </h2>
                  <CardGrid
                    items={bucket}
                    showLevel
                    stageOf={stageOf}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ),
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Lessons
