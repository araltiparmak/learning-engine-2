import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { getCookie, setCookie, deleteCookie } from '../lib/cookies'
import WordLookup from './WordLookup'
import { t, felixAvailable } from '../i18n'

// The note area for the current page (lesson/quiz). Because cookieName is fixed, a
// remount loads cleanly — there is no race that could write to the wrong cookie.
function NoteArea({ cookieName }: { cookieName: string }) {
  const [text, setText] = useState(() => getCookie(cookieName))
  useEffect(() => {
    const id = setTimeout(() => {
      if (text.trim()) setCookie(cookieName, text)
      else deleteCookie(cookieName)
    }, 400)
    return () => clearTimeout(id)
  }, [text, cookieName])
  return (
    <>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        placeholder={t.notes.placeholder}
        className="mt-2 w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
      />
      <p className="mt-1 text-xs text-gray-400">{t.notes.cookieNote}</p>
    </>
  )
}

// The collapsible panel hanging off the right edge. It appears on lesson and quiz pages
// only, and holds two things behind tabs:
//   'notes' — free text for the current page, written to that page's cookie
//   'words' — the words the learner wants to learn, looked up through Felix (WordLookup)
// The first is per page, the second is the same list everywhere; the notes page shows
// both again, which is where they are reachable from outside a lesson.
function NotesWidget() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'notes' | 'words'>('notes')

  let cookieName = ''
  if (pathname.startsWith('/dersler/')) {
    const slug = pathname.slice('/dersler/'.length)
    if (slug) cookieName = `note_l_${slug}`
  } else if (pathname.startsWith('/quiz/')) {
    const slug = pathname.slice('/quiz/'.length)
    if (slug) cookieName = `note_q_${slug}`
  }

  if (!cookieName) return null

  const hasNote = getCookie(cookieName).trim().length > 0

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title={t.notes.tab}
        aria-label={t.notes.open}
        className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1 rounded-l-lg bg-brand-600 py-3 pl-2.5 pr-2 text-white shadow-lg transition hover:bg-brand-700"
      >
        <span className="text-lg leading-none">📝</span>
        <span className="text-xs font-semibold [writing-mode:vertical-rl]">{t.notes.tab}</span>
        {hasNote && <span className="h-2 w-2 rounded-full bg-green-300" />}
      </button>
    )
  }

  const tabButton = (value: 'notes' | 'words', label: string) => (
    <button
      onClick={() => setTab(value)}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
        tab === value ? 'bg-white text-brand-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="fixed right-4 top-24 z-40 flex max-h-[calc(100vh-8rem)] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-xl border border-brand-200 bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          {t.notes.panelTitle}
        </p>
        <button
          onClick={() => setOpen(false)}
          aria-label={t.notes.close}
          className="rounded px-2 text-2xl leading-none text-gray-400 hover:text-gray-700"
        >
          –
        </button>
      </div>

      {/* The word list is Felix's lookup, which answers in Turkish only (see felixAvailable). */}
      {felixAvailable && (
        <div className="mt-2 flex gap-1 self-start rounded-lg bg-gray-100 p-1">
          {tabButton('notes', t.notes.thisPage)}
          {tabButton('words', t.notes.myWords)}
        </div>
      )}

      {/* Both panes stay mounted and the inactive one is hidden: unmounting would throw
          away a half-typed note (NoteArea saves on a 400ms debounce) and a lookup that is
          still in flight. */}
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto">
        <div className={tab === 'notes' ? '' : 'hidden'}>
          <NoteArea key={cookieName} cookieName={cookieName} />
        </div>
        {felixAvailable && (
          <div className={tab === 'words' ? '' : 'hidden'}>
            <WordLookup />
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesWidget
