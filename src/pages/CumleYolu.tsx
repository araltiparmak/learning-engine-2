import { useState } from 'react'
import mountainsData from '#content/pages/cumleYolu.json'
import pageMeta from '#content/pages/pageMeta.json'
import Mascot from '../components/Mascot'
import SpeakButton from '../components/SpeakButton'
import SentenceBuilder from '../components/SentenceBuilder'
import type { SentenceElement } from '../components/SentenceBuilder'

type Exercise = {
  sentence: string
  tr: string
  parts: SentenceElement[]
  distractors?: SentenceElement[]
  altSentences?: string[]
  tipWrong?: string
  tipOrder: string
}

type Level = {
  id: string
  title: string
  level: string
  emoji: string
  station: string
  concept: string
  de: string
  newWords?: { de: string; tr: string }[]
  exercises: Exercise[]
}

type Meta = { metersPerLevel: number; ranks: string[] }

const { meta, levels } = mountainsData as { meta: Meta; levels: Level[] }

// Rank by number of completed Stufen; if the list in the JSON runs short, the last rank sticks
const rankFor = (completed: number) =>
  meta.ranks[Math.min(completed, meta.ranks.length - 1)]

const COOKIE_NAME = 'satzbauWeg'

function readDone(): Set<string> {
  const entry = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
  if (!entry) return new Set()
  const value = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1))
  return new Set(value ? value.split('|') : [])
}

function writeDone(done: Set<string>) {
  const value = encodeURIComponent([...done].join('|'))
  document.cookie = `${COOKIE_NAME}=${value}; max-age=31536000; path=/; SameSite=Lax`
}

function isLevelDone(level: Level, done: Set<string>) {
  return level.exercises.every((e) => done.has(e.sentence))
}

function firstIncomplete(done: Set<string>) {
  const first = levels.findIndex((l) => !isLevelDone(l, done))
  return first === -1 ? levels.length - 1 : first
}

function CumleYolu() {
  const [done, setDone] = useState<Set<string>>(readDone)
  const [selected, setSelected] = useState<number>(() =>
    firstIncomplete(readDone()),
  )

  const level = levels[selected]
  const isUnlocked = (i: number) => i === 0 || isLevelDone(levels[i - 1], done)
  const current = level.exercises.find((e) => !done.has(e.sentence))
  const doneInLevel = level.exercises.filter((e) => done.has(e.sentence)).length
  const completedLevels = levels.filter((l) => isLevelDone(l, done)).length
  const mountainDone = completedLevels === levels.length
  const altitude = completedLevels * meta.metersPerLevel
  const maxAltitude = levels.length * meta.metersPerLevel
  const newWords = level.newWords ?? []

  const markSolved = (sentence: string) => {
    const next = new Set(done)
    next.add(sentence)
    setDone(next)
    writeDone(next)
  }

  const resetAll = () => {
    const empty = new Set<string>()
    setDone(empty)
    writeDone(empty)
    setSelected(0)
  }

  return (
    <section className="max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{pageMeta.sprachberg.title}</h2>
          <p className="mt-2 text-gray-600">{pageMeta.sprachberg.intro}</p>
        </div>
        <Mascot
          mood={mountainDone ? 'celebrate' : 'run'}
          className="w-20 shrink-0 sm:w-24"
        />
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            Unvanın:{' '}
            <strong className="text-brand-700">{rankFor(completedLevels)}</strong>
          </span>
          <span className="text-gray-500">
            Rakım: {altitude}m / {maxAltitude}m
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
            style={{ width: `${(altitude / maxAltitude) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {levels.map((l, i) => {
          const unlocked = isUnlocked(i)
          const finished = isLevelDone(l, done)
          return (
            <button
              key={l.id}
              onClick={() => unlocked && setSelected(i)}
              disabled={!unlocked}
              title={`${l.station} · ${l.title}`}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                selected === i
                  ? 'bg-brand-600 text-white'
                  : finished
                    ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                    : unlocked
                      ? 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-400'
                      : 'bg-gray-100 text-gray-400'
              }`}
            >
              {unlocked ? l.emoji : '🔒'} {i + 1}
              {finished && ' ✓'}
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">
            {level.emoji} {level.station}
          </h2>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
            {level.level}
          </span>
          <span className="text-sm text-gray-500">
            Stufe {selected + 1} · {level.title} · {doneInLevel}/
            {level.exercises.length}
          </span>
        </div>

        <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Mascot mood="teach" className="mt-0.5 w-10 shrink-0" />
            <div className="text-sm text-gray-700">
              <p>{level.concept}</p>
              <p className="mt-1.5 text-xs text-gray-500 italic">
                <span className="mr-1.5 rounded bg-gray-200 px-1 py-0.5 text-[10px] font-semibold not-italic text-gray-600">
                  DE
                </span>
                {level.de}
              </p>
            </div>
          </div>
        </div>

        {newWords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {newWords.map((word) => {
              // The -en/-n ending is stripped so conjugated verbs match too
              // (duschen → "dusche", bleiben → "bleibt")
              const stem = word.de.endsWith('en')
                ? word.de.slice(0, -2)
                : word.de.endsWith('n')
                  ? word.de.slice(0, -1)
                  : word.de
              const inCurrent =
                !current ||
                current.sentence.toLowerCase().includes(stem.toLowerCase())
              return (
                <span
                  key={word.de}
                  title={inCurrent ? undefined : 'Bu istasyonun başka bir cümlesinde geçiyor'}
                  className={`rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-800 ring-1 ring-sky-200 ${
                    inCurrent ? '' : 'opacity-45'
                  }`}
                >
                  <strong>{word.de}</strong> · {word.tr}
                  <SpeakButton text={word.de} />
                </span>
              )
            })}
          </div>
        )}

        {current ? (
          <>
            <p className="mt-5 text-lg">
              Kur: <strong>&ldquo;{current.tr}&rdquo;</strong>
            </p>
            <SentenceBuilder
              key={current.sentence}
              sentence={current.sentence}
              tr={current.tr}
              parts={current.parts}
              distractors={current.distractors}
              altSentences={current.altSentences}
              tipWrong={current.tipWrong}
              tipOrder={current.tipOrder}
              onSolved={() => markSolved(current.sentence)}
            />
          </>
        ) : (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-5 text-center">
            <Mascot mood="celebrate" className="mx-auto w-20" />
            <p className="mt-2 font-semibold text-green-800">
              {level.emoji} {level.station} fethedildi!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Yeni unvanın: <strong>{rankFor(completedLevels)}</strong>
            </p>
            {selected + 1 < levels.length ? (
              <button
                onClick={() => setSelected(selected + 1)}
                className="mt-4 rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700"
              >
                Tırmanışa devam → {levels[selected + 1].emoji}{' '}
                {levels[selected + 1].station}
              </button>
            ) : (
              <p className="mt-2 text-sm text-green-700">
                🏔️ Sprachberg&rsquo;in zirvesindesin — wenn rüzgârını bile
                aştın, artık modal fiillerden yan cümlelere her kalıbı
                kurabiliyorsun. Sprachmeister! 🏆
              </p>
            )}
          </div>
        )}
      </div>

      {completedLevels > 0 && (
        <p className="mt-4 text-center">
          <button
            onClick={resetAll}
            className="text-sm text-gray-400 underline hover:text-gray-600"
          >
            Tırmanışı sıfırla ve taban kampına dön
          </button>
        </p>
      )}
    </section>
  )
}

export default CumleYolu
