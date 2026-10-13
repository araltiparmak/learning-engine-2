import type { ReactNode } from 'react'
import { Link } from 'react-router'
import De from './De'
import Mascot from './Mascot'
import SpeakButton from './SpeakButton'
import { RowFavProvider } from './rowFavorites'
import Reveal from './Reveal'
import { inline } from './inline'
import { registry } from './lessons'
import { estimateMinutes } from '../lib/lessonTime'
import { lessonPosition } from '../lib/lessonOrder'
import { t, gloss } from '../i18n'
import { slugify } from '../lib/slugify'
import type { Cta, Level } from '../config/types'

// Generic lesson renderer: a whole lesson is produced from the ordered "blocks" array
// in its JSON. Adding a lesson or a language means writing new JSON; this component
// does not change.
//
// The block types here are LANGUAGE-NEUTRAL (paragraph, heading, tip, image, CTA…).
// Anything shaped for one kind of lesson goes through a `component` block, whose name
// is looked up in the block registry (components/lessons/index.ts); a build only carries
// the components its own content uses.
// Quizzes are not here: they attach to a lesson through the `lesson` field in
// quizzes.json and are rendered under the lesson by LessonQuizzes.

// Favouritable blocks carry a permanent `id`, independent of block order: adding a
// new paragraph to a lesson does not shift anyone's existing favourites.
type Favoritable = { id?: string }

// `daily` marks the blocks the daily plan (/gunluk) shows as the lesson's short version.
type Block = { daily?: boolean } & (
  | { type: 'paragraph'; text: string; de?: string }
  | { type: 'heading'; text: string }
  | { type: 'highlight'; text: string; speak?: string }
  // One short, vivid sentence that carries the whole rule, to learn by heart.
  | { type: 'keySentence'; de: string; tr?: string; en?: string; note?: string }
  | { type: 'image'; src: string; alt: string; maxW?: string }
  | { type: 'video'; src: string; title: string; minutes?: number }
  | { type: 'tip'; title: string; text?: string; items?: string[]; de?: string }
  | { type: 'reveal'; intro?: string; items: { q: string; a: string }[] }
  | ({ type: 'component'; name: string; props?: Record<string, unknown> } & Favoritable)
  | { type: 'cta'; title: string; note?: string; links: Cta[] }
)

export type Review = { title?: string; items: string[] }

export type LessonDoc = { title: string; level: Level; blocks: Block[]; review?: Review }

// Makes a table/card block's own rows favouritable one by one (see ./rowFavorites).
// A block without an id cannot be favourited at all. There is no set-level button:
// favouriting happens per row, via the star inside each row.
function favWrap(inner: ReactNode, block: Favoritable, i: number, slug: string): ReactNode {
  if (!slug || !block.id) return <div key={i}>{inner}</div>
  return (
    <div key={i}>
      <RowFavProvider value={{ blockKey: `${slug}#${block.id}` }}>{inner}</RowFavProvider>
    </div>
  )
}

// Anchor ids for headings, so the contents box and the address bar can point at a
// section. Turkish letters are folded to ascii; the block index keeps two identical
// headings apart.
function headingId(text: string, i: number): string {
  return `${slugify(text) || 'bolum'}-${i}`
}

export type ContentsEntry = { id: string; label: string }

// The contents box only pays off on a lesson with several sections; a short lesson
// with one or two headings is scanned faster than a list of them.
const MIN_CONTENTS = 3

// Headings often number themselves ("2. ein/kein sonrası"); the list numbers every
// entry, so the heading's own number is dropped to avoid "2  2. ein/kein".
function contentsOf(blocks: Block[]): ContentsEntry[] {
  return blocks.flatMap((b, i) =>
    b.type === 'heading'
      ? [{ id: headingId(b.text, i), label: b.text.replace(/^\d+[.)]\s*/, '') }]
      : [],
  )
}

/** The contents list a lesson shows, or [] when it has too few sections to need one. */
export function lessonContents(lesson: LessonDoc, extra: ContentsEntry[] = []): ContentsEntry[] {
  const headings = contentsOf(lesson.blocks)
  return headings.length >= MIN_CONTENTS ? [...headings, ...extra] : []
}

function renderBlock(block: Block, i: number, slug = ''): ReactNode {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={i} id={headingId(block.text, i)} className="mt-10 scroll-mt-20 text-2xl font-semibold">
          {block.text}
        </h2>
      )
    case 'paragraph':
      return (
        <div key={i}>
          <p className="mt-4 text-gray-700">{inline(block.text)}</p>
          {block.de && <De>{block.de}</De>}
        </div>
      )
    case 'highlight':
      return (
        <p key={i} className="mt-2 rounded-lg bg-gray-100 px-4 py-3 italic">
          {inline(block.text)}
          {block.speak && <SpeakButton text={block.speak} />}
        </p>
      )
    case 'keySentence':
      return (
        <div key={i} className="mt-5 rounded-xl border border-accent-200 bg-accent-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
            🔑 {t.lesson.keySentence}
          </p>
          <p className="mt-1.5 text-xl font-semibold leading-snug text-gray-900">
            {block.de}
            <SpeakButton text={block.de} />
          </p>
          {gloss(block) && <p className="mt-1 text-gray-600">{gloss(block)}</p>}
          {block.note && <p className="mt-2 text-sm text-gray-600">{inline(block.note)}</p>}
        </div>
      )
    case 'image':
      return (
        <img
          key={i}
          src={block.src}
          alt={block.alt}
          loading="lazy"
          className={`mt-4 w-full rounded-lg border border-gray-200 shadow-sm ${block.maxW ?? 'max-w-xl'}`}
        />
      )
    // block.src: a YouTube video ID (not a URL) — appended to the youtube-nocookie.com embed address.
    case 'video':
      return (
        <div
          key={i}
          className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.src}`}
            title={block.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    case 'tip':
      return (
        <div key={i} className="mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Mascot mood="teach" className="w-9 shrink-0" />
            <p className="font-medium text-brand-800">{block.title}</p>
          </div>
          {block.text && <p className="mt-1 text-sm text-gray-700">{inline(block.text)}</p>}
          {block.items && (
            <ul className="mt-1 space-y-1 text-sm text-gray-700">
              {block.items.map((it, k) => (
                <li key={k}>{inline(it)}</li>
              ))}
            </ul>
          )}
          {block.de && <De>{block.de}</De>}
        </div>
      )
    case 'reveal':
      return (
        <div key={i} className="mt-4">
          <Reveal intro={block.intro} items={block.items} />
        </div>
      )
    case 'component': {
      const C = registry[block.name]
      if (!C) {
        if (import.meta.env.DEV) {
          console.warn(`[lesson] "${block.name}" is not registered in lessonRegistry.`)
        }
        return null
      }
      return favWrap(<C {...(block.props ?? {})} />, block, i, slug)
    }
    case 'cta':
      return (
        <div key={i} className="mt-8 rounded-lg border border-brand-300 bg-brand-50 p-5 text-center">
          <p className="font-medium text-brand-900">{block.title}</p>
          {block.note && <p className="mt-1 text-sm text-gray-700">{block.note}</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {block.links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={
                  l.primary
                    ? 'rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700'
                    : 'rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-100'
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )
    default:
      return null
  }
}

function LessonRenderer({
  lesson,
  showBack = true,
  slug = '',
  minutes,
  extraContents = [],
  sideContents = false,
}: {
  lesson: LessonDoc
  showBack?: boolean
  slug?: string
  /**
   * Study time when the caller knows it (the build-time figure for a /dersler lesson,
   * which includes its source tables and quizzes); otherwise estimated from the document.
   */
  minutes?: number
  /** Sections the page adds under the document (quiz, writing…) — listed after the headings. */
  extraContents?: ContentsEntry[]
  /** The page shows the contents in a side column on wide screens, so the box here hides there. */
  sideContents?: boolean
}) {
  const pos = slug ? lessonPosition(slug) : null
  const headings = contentsOf(lesson.blocks)
  const contents = lessonContents(lesson, extraContents)

  return (
    <article className="max-w-3xl">
      {showBack && (
        <nav aria-label={t.lesson.location} className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link to="/dersler" className="text-brand-600 hover:underline">
            {t.lesson.back}
          </Link>
          {pos && (
            <>
              <span className="text-gray-300">/</span>
              <span>{pos.section}</span>
              <span className="text-gray-300">/</span>
              <span>
                {t.lesson.position(pos.index)} <span className="text-gray-400">/ {pos.total}</span>
              </span>
            </>
          )}
        </nav>
      )}
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">{lesson.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {lesson.level}
        </span>
        <span>{t.lesson.minutes(minutes ?? estimateMinutes(lesson))}</span>
        {headings.length > 0 && <span>{t.lesson.sectionCount(headings.length)}</span>}
      </div>

      {contents.length > 0 && (
        <nav
          aria-label={t.lesson.contents}
          className={`mt-5 rounded-xl border border-gray-200 bg-white px-4 py-3 ${sideContents ? 'lg:hidden' : ''}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t.lesson.inThisLesson}
          </p>
          <ol className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {contents.map((c, i) => (
              <li key={c.id} className="flex gap-2">
                <span className="w-4 shrink-0 text-right tabular-nums text-gray-400">{i + 1}</span>
                <a href={`#${c.id}`} className="text-gray-700 hover:text-brand-700 hover:underline">
                  {c.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {lesson.blocks.map((block, i) => renderBlock(block, i, slug))}
    </article>
  )
}

// Renders a single block without its favourite button — used by the Favourites page.
// `only` narrows the block to the given row hashes, so a favourited single card renders
// as that card alone instead of the whole set (see ./rowFavorites).
export function BlockView({
  block,
  only,
}: {
  block: LessonDoc['blocks'][number]
  only?: string[]
}) {
  const node = renderBlock(block, 0)
  if (!only) return <>{node}</>
  return <RowFavProvider value={{ blockKey: '', only }}>{node}</RowFavProvider>
}

export default LessonRenderer
