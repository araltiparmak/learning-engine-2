import { useState } from 'react'
import wordsData from '#content/pages/kelimeler.json'
import pageMeta from '#content/pages/pageMeta.json'
import Mascot from '../components/Mascot'
import SpeakButton from '../components/SpeakButton'
import { shuffle } from '../lib/shuffle'
import { getCookieSet, setCookieSet } from '../lib/cookies'
import { toggled } from '../lib/sets'
import { language } from '../lib/language'
import type { Level } from '../config/types'

type Word = {
  de: string
  tr: string
  en: string
  level: Level
  thema?: string
  rank?: number
  /** The word's surface form in the sentence; only set when it cannot be found
   *  automatically (e.g. verlieren → verloren). Otherwise the matcher below finds it. */
  focus?: string
  example: { de: string; tr: string }
}

const words = wordsData as Word[]

// The card is about the SENTENCE; the word is highlighted inside it. Since words are
// written in dictionary form (noun with article, verb in the infinitive), their form in
// the sentence has to be located: drop the article, look for the whole word, then fall
// back to its stem (arbeiten → arbeitet). If nothing matches, nothing is highlighted —
// the sentence still renders correctly.
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// The articles a dictionary form starts with (language.json → articles: der/die/das).
const ARTICLE = new RegExp(`^(${(language.articles ?? []).map(escape).join('|')})\\s+`, 'i')

function splitAroundWord(sentence: string, word: Word): [string, string, string] {
  const bare = word.de.replace(ARTICLE, '').split(/[\s/]/)[0]
  const candidates = [word.focus, bare].filter(Boolean) as string[]
  const stem = bare.length > 5 ? bare.slice(0, -2) : bare.slice(0, 4)
  const patterns = [
    ...candidates.map((c) => new RegExp(`\\b${escape(c)}\\b`, 'i')),
    ...(stem.length >= 4 ? [new RegExp(`\\b${escape(stem)}\\w*`, 'i')] : []),
  ]
  for (const re of patterns) {
    const m = re.exec(sentence)
    if (m) {
      return [sentence.slice(0, m.index), m[0], sentence.slice(m.index + m[0].length)]
    }
  }
  return [sentence, '', '']
}

function Sentence({ word, className = '' }: { word: Word; className?: string }) {
  const [before, hit, after] = splitAroundWord(word.example.de, word)
  return (
    <span className={className}>
      {before}
      {hit && <strong className="font-bold text-brand-700">{hit}</strong>}
      {after}
    </span>
  )
}

const ALL = 'all'
// A theme's tab label, from the page copy (pageMeta.json → kelimeler.themes).
const themaLabels: Record<string, string> = pageMeta.kelimeler.themes

// Themes present in the data; one or more of them makes the "All + themes" tabs appear
const themes = [...new Set(words.map((w) => w.thema).filter(Boolean))] as string[]
const tabs = themes.length > 0 ? [ALL, ...themes] : [ALL]
const tabLabel = (tab: string) =>
  tab === ALL ? 'Hepsi' : (themaLabels[tab] ?? tab)

// With more than one level present (once B1 lands), the cards show a level badge
const levels = [...new Set(words.map((w) => w.level))]

// The German word itself is the identity: both the React key and the record in the
// "learned" cookie. Listing the same word twice would mark both as learned and corrupt
// the list — hence the dev warning.
if (import.meta.env.DEV) {
  const seen = new Set<string>()
  const dups = words.filter((w) => !seen.add(w.de)).map((w) => w.de)
  if (dups.length > 0) {
    console.warn(`[vocabulary] duplicate word entries: ${[...new Set(dups)].join(', ')}`)
  }
}

function poolFor(tab: string): Word[] {
  if (tab === ALL) return words
  return words
    .filter((w) => w.thema === tab)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
}

const COOKIE_NAME = 'gelernteWoerter'

const readLearned = () => getCookieSet(COOKIE_NAME)
const writeLearned = (learned: Set<string>) => setCookieSet(COOKIE_NAME, learned)

function buildDeck(tab: string, learned: Set<string>): Word[] {
  const remaining = poolFor(tab).filter((w) => !learned.has(w.de))
  // A theme deck keeps its rank order; the "All" deck comes shuffled
  return tab === ALL ? shuffle(remaining) : remaining
}

// Two study modes: working through them one at a time by translating (deck) and
// reviewing them all at once (grid). Both use the same "learned" cookie, still keyed by
// the word itself, so existing progress carries over.
type Mode = 'deck' | 'grid'

function Vocabulary() {
  const [learned, setLearned] = useState<Set<string>>(readLearned)
  const [tab, setTab] = useState<string>(tabs[0])
  const [mode, setMode] = useState<Mode>('deck')
  const [deck, setDeck] = useState<Word[]>(() =>
    buildDeck(tabs[0], readLearned()),
  )
  const [flipped, setFlipped] = useState(false)

  const pool = poolFor(tab)
  const learnedCount = pool.filter((w) => learned.has(w.de)).length
  const card = deck[0]

  const selectTab = (next: string) => {
    setTab(next)
    setDeck(buildDeck(next, learned))
    setFlipped(false)
  }

  // Marks made in the grid affect the deck too, so the deck is rebuilt
  const selectMode = (next: Mode) => {
    setMode(next)
    if (next === 'deck') {
      setDeck(buildDeck(tab, learned))
      setFlipped(false)
    }
  }

  const saveLearned = (next: Set<string>) => {
    setLearned(next)
    writeLearned(next)
  }

  const toggleLearned = (word: Word) => saveLearned(toggled(learned, word.de))

  const markLearned = () => {
    saveLearned(toggled(learned, card.de, true))
    setDeck((d) => d.slice(1))
    setFlipped(false)
  }

  const nextCard = () => {
    setDeck((d) => (d.length > 1 ? [...d.slice(1), d[0]] : d))
    setFlipped(false)
  }

  const resetAll = () => {
    const wordSet = new Set(pool.map((w) => w.de))
    const next = new Set([...learned].filter((id) => !wordSet.has(id)))
    saveLearned(next)
    setDeck(buildDeck(tab, next))
    setFlipped(false)
  }

  return (
    <section className={mode === 'deck' ? 'max-w-xl' : ''}>
      <p className="max-w-2xl text-gray-600">{pageMeta.kelimeler.intro}</p>

      <div className="mt-5 inline-flex rounded-lg bg-gray-100 p-1">
        {(
          [
            ['deck', '🎴 Cümle destesi'],
            ['grid', '📋 Tüm cümleler'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => selectMode(m)}
            aria-pressed={mode === m}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
              mode === m ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tabs.length > 1 &&
          tabs.map((t) => (
            <button
              key={t}
              onClick={() => selectTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-400'
              }`}
            >
              {tabLabel(t)}
            </button>
          ))}
        <span className="ml-auto text-sm text-gray-500">
          Öğrenilen: {learnedCount} / {pool.length}
        </span>
      </div>

      {mode === 'grid' ? (
        <>
          <p className="mt-4 text-sm text-gray-500">
            Bu listedeki {pool.length} cümlenin hepsi bir arada. Karta tıklayınca
            &ldquo;öğrendim&rdquo; işareti açılıp kapanır; işaretlediklerin deste modunda
            karşına çıkmaz.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pool.map((w) => {
              const done = learned.has(w.de)
              return (
                <li key={w.de}>
                  <div
                    className={`flex h-full flex-col rounded-xl border p-4 transition ${
                      done
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-brand-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base leading-snug">
                        <Sentence word={w} />
                        <SpeakButton text={w.example.de} />
                      </p>
                      <button
                        onClick={() => toggleLearned(w)}
                        aria-pressed={done}
                        aria-label={`${w.de}: ${done ? 'öğrenildi işaretini kaldır' : 'öğrendim olarak işaretle'}`}
                        title={done ? 'Öğrenildi — kaldır' : 'Öğrendim olarak işaretle'}
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold transition ${
                          done
                            ? 'border-green-500 bg-green-600 text-white'
                            : 'border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-600'
                        }`}
                      >
                        ✓
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{w.example.tr}</p>
                    <p className="mt-2 border-t border-gray-100 pt-2 text-sm">
                      <span className="font-semibold text-brand-700">{w.de}</span>
                      <span className="mt-0.5 block text-xs text-gray-600">
                        {w.tr} <span className="text-gray-400">· {w.en}</span>
                      </span>
                    </p>
                    {levels.length > 1 && (
                      <span className="mt-2 self-start rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {w.level}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {learnedCount > 0 && (
            <p className="mt-6 text-center">
              <button
                onClick={resetAll}
                className="text-sm text-gray-400 underline hover:text-gray-600"
              >
                Öğrenilenleri sıfırla
              </button>
            </p>
          )}
        </>
      ) : card ? (
        <>
          <div
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setFlipped((f) => !f)
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? pageMeta.kelimeler.flipToSentence : 'Kartı çevir: çeviriyi gör'}
            className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition select-none hover:shadow-md focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {!flipped ? (
              <>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {card.level}
                </span>
                <p className="mt-3 text-2xl font-semibold leading-snug">
                  <Sentence word={card} />
                  <span onClick={(e) => e.stopPropagation()}>
                    <SpeakButton text={card.example.de} />
                  </span>
                </p>
                <p className="mt-4 text-sm text-gray-400">
                  Cümleyi kendi kendine çevir — sonra karta tıkla
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium leading-snug text-gray-800">
                  {card.example.tr}
                </p>
                <p className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-3 text-sm">
                  <span className="font-bold text-brand-700">{card.de}</span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <SpeakButton text={card.de} />
                  </span>
                  <span className="block text-gray-700">
                    {card.tr} <span className="text-gray-400">· {card.en}</span>
                  </span>
                </p>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={markLearned}
              className="flex-1 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Öğrendim ✓
            </button>
            <button
              onClick={nextCard}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:border-brand-400"
            >
              Sonraki →
            </button>
          </div>
          <p className="mt-3 text-center text-sm text-gray-400">
            Bu destede {deck.length} cümle kaldı
          </p>
          {learnedCount > 0 && (
            <p className="mt-6 text-center">
              <button
                onClick={resetAll}
                className="text-sm text-gray-400 underline hover:text-gray-600"
              >
                Öğrenilenleri sıfırla
              </button>
            </p>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <Mascot mood="celebrate" className="mx-auto w-24" />
          <p className="mt-2 font-semibold text-green-800">
            Tüm cümleleri öğrendin!
          </p>
          <button
            onClick={resetAll}
            className="mt-4 rounded-lg border border-green-600 px-5 py-2 font-semibold text-green-700 transition hover:bg-green-100"
          >
            Kartları sıfırla ve tekrar çalış
          </button>
        </div>
      )}
    </section>
  )
}

export default Vocabulary
