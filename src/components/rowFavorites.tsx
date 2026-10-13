import { createContext, useContext, useState } from 'react'
import { hashText } from '../lib/audioHash'
import { isFavoriteBlock, toggleFavoriteBlock } from '../lib/favorites'
import { t } from '../i18n'

// Saving a SINGLE row inside a card/table block — the only way to save from a lesson.
//
// In the UI this is "Not al": saved rows and hand-written notes both land on /notlar,
// which is the one place the user keeps things. Storage stays split on purpose — a saved
// row is a REFERENCE that /notlar re-renders through BlockView, so it keeps its audio
// button, translation and table layout, which a snapshot of the text would lose. The
// cookie is still named `favoriten` so rows saved before the merge survive.
//
// Two id shapes live in that cookie:
//
//   "<slug>#<block-id>"            a whole set; no longer created, but older cookies still
//                                  carry these and the Favourites page renders them
//   "<slug>#<block-id>:<rowHash>"  one row of that set (this file)
//
// rowHash is hashText() of the row's leading text (the German line, the term, the verb…),
// so it survives reordering and stays short — the favourites cookie holds ids, not text.
// Changing that text drops the favourite, which is the same trade-off the audio files make.
//
// A list component opts in with two calls, and needs no props for it:
//
//   const fav = useRowFavorites()
//   items.filter((it) => fav.shows(it.de)).map((it) => <li>{fav.save(it.de)} …</li>)
//
// Outside a lesson (no provider) `shows` is always true and `save` renders nothing, so a
// converted component keeps working anywhere it is used.
type RowFavContext = {
  // "<slug>#<block-id>" of the surrounding block; empty when rows cannot be favourited.
  blockKey: string
  // When set, ONLY these row hashes render — the Favourites page shows one card of a set.
  only?: string[]
}

const Ctx = createContext<RowFavContext>({ blockKey: '' })

export const RowFavProvider = Ctx.Provider

export function useRowFavorites() {
  const { blockKey, only } = useContext(Ctx)
  return {
    // Should this row render? Always true in a lesson; on the Favourites page only the
    // favourited row passes.
    shows: (text: string) => !only || only.includes(hashText(text)),
    // The "Not al" button for this row. Null when rows cannot be saved here, and on
    // /notlar itself (which has its own "Kaldır" button for the whole card).
    // `inline` drops the float — for a row whose right edge is already occupied (a flex
    // row with a value on the right), where the button has to sit in the flow instead.
    save: (text: string, opts?: { inline?: boolean }) =>
      blockKey && !only ? (
        <NoteButton id={`${blockKey}:${hashText(text)}`} inline={opts?.inline} />
      ) : null,
  }
}

// Floated by default so a row can host it without changing its layout: the text flows
// beside it. A bookmark rather than a star — the row is going to the notes page, not to
// a separate favourites list. Feed cards use it too, with their own id shape.
export function NoteButton({
  id,
  inline,
  className = '',
}: {
  id: string
  inline?: boolean
  className?: string
}) {
  const [saved, setSaved] = useState(() => isFavoriteBlock(id))
  const label = saved ? t.notes.unsave : t.notes.save
  return (
    <button
      type="button"
      onClick={() => setSaved(toggleFavoriteBlock(id))}
      title={label}
      aria-label={label}
      aria-pressed={saved}
      className={`ml-2 align-middle leading-none transition ${inline ? '' : 'float-right'} ${className} ${
        saved ? 'text-brand-600' : 'text-gray-300 hover:text-brand-600'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="inline-block h-4 w-4"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  )
}
