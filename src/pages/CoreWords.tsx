import { useState } from 'react'
import data from '#content/pages/coreWords.json'
import pageMeta from '#content/pages/pageMeta.json'
import SpeakButton from '../components/SpeakButton'
import { gloss, secondGloss } from '../i18n'
import { readStoredList, writeStoredList } from '../lib/storage'
import { toggled } from '../lib/sets'

type CoreWord = {
  de: string
  tr: string
  en: string
  /** What the speak button reads when `de` is not a single readable form
   *  ("das Paar / ein paar", "kümmern (sich)"). */
  speak?: string
}

// One person's forms by column key (the columns are the page copy's), plus its meaning.
type PronounRow = Record<string, string> & { tr: string; en: string }

// Ranked by spoken frequency (OpenSubtitles 2018 German list, lemmatised), keeping only
// words on the Goethe A1/A2 lists and dropping film-dialogue noise (töten, Waffe…).
// Pronouns and conjunctions are left out of the ranking: the personal pronouns get their
// own case table below, the rest are taught in the grammar lessons.
// The array order IS the rank, so each band is a slice and no word sits in two bands.
const words = data.words as CoreWord[]
const pronouns = data.pronouns as PronounRow[]

const PRONOUNS = 'pronouns'
const tabs = [
  { id: '100', label: 'İlk 100', from: 0, to: 100 },
  { id: '250', label: '101–250', from: 100, to: 250 },
  { id: '500', label: '251–500', from: 250, to: 500 },
  { id: PRONOUNS, label: 'Kişi zamirleri', from: 0, to: 0 },
]

// localStorage rather than a cookie: 500 German words with umlauts, URI-encoded, outgrow
// the ~4 KB a cookie holds. Keyed by the word itself, so re-ranking the list keeps marks.
const LEARNED_KEY = 'temelKelimelerOgrenildi'

const readLearned = () => new Set(readStoredList<string>(LEARNED_KEY))

function CoreWords() {
  const [tabId, setTabId] = useState(tabs[0].id)
  const [learned, setLearned] = useState(readLearned)
  const tab = tabs.find((t) => t.id === tabId)!

  const toggle = (de: string) => {
    const next = toggled(learned, de)
    setLearned(next)
    writeStoredList(LEARNED_KEY, next)
  }

  // Rank travels with the word, so a learned word keeps its number at the bottom.
  const band = words.slice(tab.from, tab.to).map((w, i) => ({ ...w, rank: tab.from + i + 1 }))
  const open = band.filter((w) => !learned.has(w.de))
  const done = band.filter((w) => learned.has(w.de))

  return (
    <section>
      <p className="max-w-2xl text-gray-600">{pageMeta.temelKelimeler.intro}</p>

      <div className="mt-5 inline-flex flex-wrap rounded-lg bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTabId(t.id)}
            aria-pressed={tabId === t.id}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
              tabId === t.id
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabId === PRONOUNS ? (
        <PronounTable />
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-500">
            {done.length} / {band.length} öğrenildi
          </p>
          <ol className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {[...open, ...done].map((w) => {
              const isDone = learned.has(w.de)
              const second = secondGloss(w)
              return (
                <li
                  key={w.de}
                  className={`flex items-center gap-3 px-4 py-2.5 ${isDone ? 'bg-gray-50' : ''}`}
                >
                  <span className="w-8 shrink-0 text-right text-xs text-gray-400 tabular-nums">
                    {w.rank}
                  </span>
                  <div
                    className={`min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-4 ${
                      isDone ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1.5 sm:w-56 sm:shrink-0">
                      <span className="font-semibold text-gray-900">{w.de}</span>
                      <SpeakButton text={w.speak ?? w.de} />
                    </span>
                    <span className="block text-sm text-gray-600">
                      {gloss(w)}
                      {second && (
                        <>
                          {' '}
                          <span className="text-gray-400">·</span>{' '}
                          <span className="text-gray-500 italic" lang="en">
                            {second}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => toggle(w.de)}
                    aria-pressed={isDone}
                    aria-label={
                      isDone ? `${w.de}: öğrenildi işaretini kaldır` : `${w.de}: öğrendim`
                    }
                    title={isDone ? 'İşareti kaldır' : 'Öğrendim'}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                      isDone
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-gray-300 text-transparent hover:border-brand-400 hover:text-brand-400'
                    }`}
                  >
                    ✓
                  </button>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </section>
  )
}

// The table's columns — which forms, under which heading — are the page copy's
// (pageMeta.json → temelKelimeler.pronounColumns). The meaning sits under the first.
// `faded` greys out a form that is rarely used.
type PronounColumn = { key: string; label: string; lang: string; faded?: boolean }
const cases: PronounColumn[] = pageMeta.temelKelimeler.pronounColumns

function PronounTable() {
  return (
    <>
      <p className="mt-4 max-w-2xl text-sm text-gray-600">{pageMeta.temelKelimeler.pronounNote}</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            <tr>
              {cases.map((c) => (
                // `lang` per header: the page is Turkish, and uppercasing a German label
                // under Turkish rules turns its i into İ (NOMİNATİV).
                <th key={c.key} lang={c.lang} className="px-3 py-2">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pronouns.map((p) => {
              const second = secondGloss(p)
              return (
                <tr key={p.en}>
                  {cases.map((c) => (
                    <td key={c.key} className="px-3 py-2">
                      <span className="flex items-center gap-1">
                        <span
                          className={`font-semibold ${c.faded ? 'text-gray-500' : 'text-gray-900'}`}
                        >
                          {p[c.key]}
                        </span>
                        <SpeakButton text={p[c.key]} />
                      </span>
                      {/* The meaning sits under the subject form rather than in its own
                          column, so it stays on screen while a phone scrolls the table. */}
                      {c === cases[0] && (
                        <span className="block text-xs text-gray-500">
                          {gloss(p)}
                          {second && (
                            <span className="italic" lang="en">
                              {' '}
                              · {second}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CoreWords
