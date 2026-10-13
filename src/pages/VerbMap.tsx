import { useState } from 'react'
import verbsData from '#content/pages/fiilHaritasi.json'
import pageMeta from '#content/pages/pageMeta.json'
import Mascot from '../components/Mascot'
import type { Mood } from '../components/Mascot'
import SpeakButton from '../components/SpeakButton'
import { inline } from '../components/inline'
import { language } from '../lib/language'
import type { Level } from '../config/types'

type Verb = {
  verb: string
  pose?: string
  tr: string
  en: string
  level: Level
  type: string
  /** An auxiliary named in language.json → auxiliaries. */
  aux: string
  partizip: string
  /** Present forms by person key; the keys and their labels are in the page copy. */
  praesens: Record<string, string>
  /** Absent for verbs with no natural imperative (wissen, kennen, gefallen, bekommen). */
  imperativ?: Record<string, string>
  rektion?: string
  example: { de: string; tr: string }
  related: string[]
  antonyms?: { verb: string; tr: string }[]
}

const verbs = verbsData as Verb[]

// Level tabs appear on their own once the data holds more than one level (B1 later).
const ALL_LEVELS = 'all'
const levels = [...new Set(verbs.map((v) => v.level))].sort()

// The card's sections — which persons a tense lists, under which heading — are the page
// copy's (pageMeta.json → fiiller), so the page knows no grammar of its own.
const { present, perfect, imperative } = pageMeta.fiiller
const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')

function VerbMap() {
  const [selected, setSelected] = useState<Verb>(verbs[0])
  const [level, setLevel] = useState<string>(ALL_LEVELS)

  // A related/antonym link may point outside the active level filter; keep the selected
  // verb visible in the list so the highlighted pill never disappears.
  const shown = verbs.filter(
    (v) => level === ALL_LEVELS || v.level === level || v.verb === selected.verb,
  )

  const selectVerb = (name: string) => {
    const found = verbs.find((v) => v.verb === name)
    if (found) setSelected(found)
  }

  const auxThirdPerson = language.auxiliaries?.[selected.aux] ?? selected.aux

  return (
    <section className="max-w-2xl">
      <p className="text-gray-600">{pageMeta.fiiller.intro}</p>

      {levels.length > 1 && (
        <div className="mt-5 inline-flex rounded-lg bg-gray-100 p-1">
          {[ALL_LEVELS, ...levels].map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              aria-pressed={level === lv}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                level === lv
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {lv === ALL_LEVELS ? `Hepsi (${verbs.length})` : lv}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {shown.map((v) => (
          <button
            key={v.verb}
            onClick={() => setSelected(v)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              selected.verb === v.verb
                ? 'bg-brand-600 font-semibold text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-400'
            }`}
          >
            {v.verb}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">
                {selected.verb}
                <SpeakButton text={selected.verb} />
              </h2>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {selected.level}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {selected.type}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  selected.aux === perfect.markedAux
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-brand-100 text-brand-700'
                }`}
              >
                {fill(perfect.badge, { aux: selected.aux })}
              </span>
            </div>
            <p className="mt-1 text-gray-600">
              {selected.tr}{' '}
              <span className="text-sm text-gray-400">· {selected.en}</span>
            </p>
          </div>
          <Mascot
            mood={(selected.pose as Mood) ?? 'happy'}
            className="w-20 shrink-0 sm:w-24"
          />
        </div>

        <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
          {present.title}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
          {present.persons.map(([key, label]) => (
            <p key={key} className="py-0.5">
              <span className="text-gray-500">{label}</span>{' '}
              <strong className="text-gray-800">{selected.praesens[key]}</strong>
            </p>
          ))}
        </div>

        <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
          {perfect.title}
        </h3>
        <p className="mt-2 text-lg">
          {perfect.subject} {auxThirdPerson}{' '}
          <strong className="text-brand-700">{selected.partizip}</strong>
          <SpeakButton text={fill(perfect.speak, { aux: auxThirdPerson, partizip: selected.partizip })} />
        </p>

        {selected.imperativ && (
          <>
            <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {imperative.title}
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-3">
              {imperative.persons.map((person) => (
                <p key={person} className="py-0.5">
                  <span className="text-gray-500">{person}</span>{' '}
                  <strong className="text-gray-800">{selected.imperativ![person]}</strong>
                  <SpeakButton text={selected.imperativ![person]} />
                </p>
              ))}
            </div>
          </>
        )}

        {selected.rektion && (
          <>
            <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {pageMeta.fiiller.government}
            </h3>
            <p className="mt-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-gray-700">
              📌 {selected.rektion}
            </p>
          </>
        )}

        <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
          Örnek cümle
        </h3>
        <p className="mt-2 rounded-lg bg-gray-100 px-4 py-3">
          <span className="italic text-gray-700">
            {selected.example.de}
            <SpeakButton text={selected.example.de} />
          </span>
          <span className="block text-sm text-gray-500">{selected.example.tr}</span>
        </p>

        <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
          İlişkili fiiller
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.related.map((name) => {
            const rel = verbs.find((v) => v.verb === name)
            return (
              <button
                key={name}
                onClick={() => selectVerb(name)}
                className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100"
              >
                {name}
                {rel && <span className="text-brand-500"> · {rel.tr}</span>}
              </button>
            )
          })}
        </div>

        {selected.antonyms && selected.antonyms.length > 0 && (
          <>
            <h3 className="mt-5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Zıt anlamlılar
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.antonyms.map((ant) => {
                const inMap = verbs.some((v) => v.verb === ant.verb)
                return inMap ? (
                  <button
                    key={ant.verb}
                    onClick={() => selectVerb(ant.verb)}
                    className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                  >
                    ↔ {ant.verb}
                    <span className="text-rose-400"> · {ant.tr}</span>
                  </button>
                ) : (
                  <span
                    key={ant.verb}
                    className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-500 ring-1 ring-gray-200"
                  >
                    ↔ {ant.verb}
                    <span className="text-gray-400"> · {ant.tr}</span>
                  </span>
                )
              })}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-sm text-gray-500">{inline(pageMeta.fiiller.footer)}</p>
    </section>
  )
}

export default VerbMap
