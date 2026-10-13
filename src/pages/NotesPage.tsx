import { Suspense, use, useState } from 'react'
import { Link } from 'react-router'
import { listCookies } from '../lib/cookies'
import config from '../config'
import { quizzes } from '../data/quizzes'
import { loadLessons } from '../data/lessons'
import type { LessonDoc } from '../components/LessonRenderer'
import { getFavoriteIds, isFeedCardId, removeFavoriteBlock } from '../lib/favorites'
import { SavedFeedCards } from '../routes'
import { BlockView } from '../components/LessonRenderer'
import WordLookup from '../components/WordLookup'
import { t, felixAvailable } from '../i18n'

// Everything the user kept, on one page. Two kinds, deliberately stored differently:
//
//   saved rows   a reference into a lesson block, re-rendered live through BlockView so
//                the audio button, translation and table layout come along; saved feed
//                cards work the same way (components/feed/SavedFeedCards.tsx)
//   written notes free text, one blob per lesson/quiz page, written in the side widget
//
// Merging them into a single storage shape would mean snapshotting the row as plain
// text and losing all of the above, so only the surface is merged.

function lessonTitle(slug: string): string {
  const l = config.lessonsList.flatMap((s) => s.lessons).find((x) => x.slug === slug)
  return l?.title ?? slug
}

function quizTitle(slug: string): string {
  return quizzes[slug]?.listTitle ?? slug
}

// Finds the nearest heading above a block, to give a saved row some context.
function nearestHeading(blocks: { type?: string; text?: string }[], index: number): string {
  for (let k = index; k >= 0; k--) {
    const b = blocks[k]
    if (b && b.type === 'heading' && b.text) return b.text
  }
  return ''
}

// A saved id is "<lesson-slug>#<block-id>" for a whole set, or
// "<lesson-slug>#<block-id>:<row-hash>" for a single card inside it. The block id is
// written in the lesson JSON, so adding content never shifts saved rows; deleting a
// block simply drops its entry.
const slugOf = (id: string) => id.slice(0, id.lastIndexOf('#'))

function resolveSaved(ids: string[], lessons: Record<string, LessonDoc>) {
  return ids
    .map((id) => {
      const hash = id.lastIndexOf('#')
      const slug = slugOf(id)
      const rest = id.slice(hash + 1)
      const colon = rest.lastIndexOf(':')
      const blockId = colon >= 0 ? rest.slice(0, colon) : rest
      const rowHash = colon >= 0 ? rest.slice(colon + 1) : undefined
      const doc = lessons[slug]
      const index = doc?.blocks.findIndex((b) => 'id' in b && b.id === blockId) ?? -1
      return { id, slug, index, rowHash, doc, block: index >= 0 ? doc?.blocks[index] : undefined }
    })
    .filter((x) => x.doc && x.block)
}

function readWritten() {
  return listCookies('note_').map((c) => {
    const rest = c.name.slice('note_'.length) // "l_<slug>" | "q_<slug>"
    const kind = rest[0] === 'q' ? 'quiz' : 'lesson'
    const slug = rest.slice(2)
    return {
      kind,
      slug,
      text: c.value,
      to: kind === 'quiz' ? `/quiz/${slug}` : `/dersler/${slug}`,
      title: kind === 'quiz' ? quizTitle(slug) : lessonTitle(slug),
    }
  })
}

function SectionTitle({ children, count }: { children: string; count: number }) {
  return (
    <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
      {children} <span className="text-gray-400">({count})</span>
    </h2>
  )
}

function NotesPage() {
  const [ids, setIds] = useState(getFavoriteIds)
  const feedIds = ids.filter(isFeedCardId)
  const rowIds = ids.filter((id) => !isFeedCardId(id))
  // Only the lessons behind the saved rows are fetched. Keyed on the first render's ids:
  // removing a row never needs a lesson that is not loaded yet, and a stable key keeps the
  // page from suspending again on every removal.
  const [slugs] = useState(() => rowIds.map(slugOf))
  const lessons = use(loadLessons(slugs))
  const remove = (id: string) => {
    removeFavoriteBlock(id)
    setIds(getFavoriteIds())
  }

  const saved = resolveSaved(rowIds, lessons)
  const savedCount = saved.length + (SavedFeedCards ? feedIds.length : 0)
  const written = readWritten()
  const empty = savedCount === 0 && written.length === 0

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t.notes.title}</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        {t.notes.intro(<span className="font-medium text-brand-700">{t.notes.saveWord}</span>)}
      </p>

      {/* The word list is not part of the empty check below: it carries its own input, so
          it is the one section that is useful before anything has been saved. */}
      {felixAvailable && (
        <div className="mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
            {t.notes.words}
          </h2>
          <div className="mt-3">
            <WordLookup />
          </div>
        </div>
      )}

      {empty ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          <p>{t.notes.emptyIntro}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>{t.notes.emptySave}</li>
            <li>{t.notes.emptyWrite}</li>
          </ul>
          <Link
            to="/dersler"
            className="mt-4 inline-block font-semibold text-brand-700 hover:underline"
          >
            {t.notes.goToLessons}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {savedCount > 0 && (
            <div>
              <SectionTitle count={savedCount}>{t.notes.saved}</SectionTitle>
              <div className="mt-3 space-y-4">
                {saved.map(({ id, slug, index, rowHash, doc, block }) => {
                  const heading = nearestHeading(
                    doc!.blocks as { type?: string; text?: string }[],
                    index,
                  )
                  return (
                    <div key={id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/dersler/${slug}`}
                            className="text-sm font-semibold text-brand-700 hover:underline"
                          >
                            {doc!.title} →
                          </Link>
                          {heading && (
                            <span className="block text-xs text-gray-400">{heading}</span>
                          )}
                        </div>
                        <button
                          onClick={() => remove(id)}
                          title={t.notes.unsave}
                          className="shrink-0 rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-500 transition hover:border-gray-400 hover:text-gray-700"
                        >
                          {t.notes.remove}
                        </button>
                      </div>
                      <BlockView block={block!} only={rowHash ? [rowHash] : undefined} />
                    </div>
                  )
                })}
                {SavedFeedCards && feedIds.length > 0 && (
                  <Suspense fallback={null}>
                    <SavedFeedCards ids={feedIds} onRemove={remove} />
                  </Suspense>
                )}
              </div>
            </div>
          )}

          {written.length > 0 && (
            <div>
              <SectionTitle count={written.length}>{t.notes.written}</SectionTitle>
              <ul className="mt-3 space-y-4">
                {written.map((n) => (
                  <li
                    key={n.kind + n.slug}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                        {n.kind === 'quiz' ? t.notes.kindQuiz : t.notes.kindLesson}
                      </span>
                      <Link to={n.to} className="font-semibold text-brand-700 hover:underline">
                        {n.title} →
                      </Link>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{n.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-gray-400">{t.notes.storageNote}</p>
    </section>
  )
}

export default NotesPage
