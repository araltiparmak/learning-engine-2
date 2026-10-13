import { Fragment } from 'react'
import SpeakButton from '../SpeakButton'
import Reveal from '../Reveal'
import { useRevealed } from '../../lib/useRevealed'
import { sourceRows } from '../../data/sources'
import { gloss, secondGloss, t } from '../../i18n'
import { useRowFavorites } from '../rowFavorites'
import { language } from '../../lib/language'
import { TONES } from '../../lib/tones'

// Visual pieces first written for the German lessons: called by name from a `component`
// block in the JSON (see ./index.ts). Not prose — these are the shapes, such as tables
// and cards, that make no sense to express in JSON. Data is never copied into the
// document; it is read from content/<target>/sources/. Like every block, each enters a
// build only when that target's content uses it.

// The person labels of a conjugation table, from the content pack (language.json).
const PERSONS = language.persons ?? []

// Row shapes of the JSON files under sources/, named at each sourceRows<Row>() call.
type Example = { de: string; tr: string; en?: string }
type VerbRow = {
  verb: string
  partizip: string
  tr: string
  en: string
  emoji?: string
  example: Example
}
type ModalRow = {
  verb: string
  praet: string
  tr: string
  en: string
  conj: string[]
  example: Example
}
type ExerciseRow = { q?: string; a?: string; verb?: string; tr?: string; en?: string; answer?: string }

// The main list component of the lessons: a German line with a speak button and its
// Turkish meaning underneath. Example sentences, annotated examples, word grids,
// conjunction and preposition cards — all of them. Data arrives either directly
// (`rows`) or from a source file (`source` + `group`).
//
// Every row field is optional; only what is present gets rendered:
//   head      emphasised heading (conjunction, preposition, word); shown next to `use`
//             or "tr · en"
//   de        the German line (with speak button) — unused on rows that set `head`
//   tr / en   its meaning ("tr · en")
//   answer    a "→ answer" line (question lists)
//   examples  {de,tr} example sentences under the heading
//   note      a small accent-coloured note at the bottom
//
// `grid: true` renders a grid instead of a list — for single words. Sentences (list)
// are italic and words are not: italics make a long sentence easier to read but a
// single word harder.
type Pair = {
  head?: string
  use?: string
  de?: string
  tr?: string
  en?: string
  answer?: string
  note?: string
  examples?: Example[]
}

export function PairList({
  source,
  group = 'examples',
  rows,
  grid,
}: {
  source?: string
  group?: string
  rows?: Pair[]
  grid?: boolean
}) {
  const all = rows ?? (source ? sourceRows<Pair>(source, group) : [])
  const fav = useRowFavorites()
  const key = (p: Pair) => p.head ?? p.de ?? ''
  const items = all.filter((p) => fav.shows(key(p)))
  return (
    <ul className={grid ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3' : 'mt-3 space-y-2'}>
      {items.map((p) => (
        <li
          key={key(p)}
          className={`rounded-lg border border-gray-100 bg-white text-sm ${
            grid ? 'px-3 py-1.5' : 'px-4 py-2'
          }`}
        >
          {fav.save(key(p))}
          {p.head ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-brand-700">{p.head}</span>
              <span className="text-gray-500">
                {p.use ?? [gloss(p), secondGloss(p)].filter(Boolean).join(' · ')}
              </span>
            </div>
          ) : (
            <>
              <span className={grid ? 'font-medium text-gray-800' : 'italic text-gray-700'}>
                {p.de}
                <SpeakButton text={p.de ?? ''} />
              </span>
              <span className="block text-gray-500">
                {gloss(p)}
                {secondGloss(p) && <span className="text-gray-400"> · {secondGloss(p)}</span>}
              </span>
            </>
          )}
          {p.answer && <span className="mt-1 block text-gray-600">→ {p.answer}</span>}
          {p.examples?.map((ex) => (
            <span key={ex.de} className="mt-1 block">
              <span className="italic text-gray-700">
                {ex.de}
                <SpeakButton text={ex.de} />
              </span>
              <span className="block text-gray-500">{gloss(ex)}</span>
            </span>
          ))}
          {p.note && <span className="mt-1 block text-xs text-brand-700">{p.note}</span>}
        </li>
      ))}
    </ul>
  )
}

type Side = { label: string; de: string; tr?: string; en?: string }
export function ContrastBox({ a, b }: { a: Side; b: Side }) {
  return (
    <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-4">
      {[a, b].map((s) => (
        <div key={s.de} className="mt-2 text-sm first:mt-0">
          <span className="text-xs font-semibold text-brand-700">{s.label}</span>
          <div className="italic text-gray-700">
            {s.de}
            <SpeakButton text={s.de} />
          </div>
          <div className="text-gray-500">{gloss(s)}</div>
        </div>
      ))}
    </div>
  )
}

type Slot = { code: string; name: string; q: string; example: string }
// A card's tone by its code comes from the content pack (language.json → slotCards); the
// German pack matches SentenceParts' te/ka/mo/lo chips, so the same slot reads the same
// colour wherever it appears on the site.
export function TeKaMoLoSlots({ slots }: { slots: Slot[] }) {
  const cards = language.slotCards
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {slots.map((s) => {
        const t = TONES[cards?.tones[s.code] ?? cards?.fallback ?? 'amber']
        return (
          <div key={s.code} className={`rounded-lg border p-3 text-center ${t.card}`}>
            <p className={`text-lg font-bold ${t.label}`}>{s.code}</p>
            <p className="text-sm font-medium">{s.name}</p>
            <p className="mt-0.5 text-xs text-gray-600">{s.q}</p>
            <p className="mt-1 text-xs italic text-gray-500">{s.example}</p>
          </div>
        )
      })}
    </div>
  )
}

// Generic conjugation/comparison table: headings and rows come entirely from JSON.
// Tables such as possessives, personal pronouns or adjective comparison need no new
// component. The first column is emphasised.
//
// `speakCols` says WHICH columns hold German (zero-based column numbers); only those
// get a speak button. Leave the Turkish meaning/note columns out — otherwise clicking
// that cell reads Turkish text through the German voice. Omit it and the table gets no
// speak buttons at all.
//
// A cell written as `["main value", "secondary value"]` renders the second as a faded
// line underneath — for cases like the definite/indefinite pair in the article table.
// `{chunks:[...]}` renders the main value split into the parts of a long compound word
// (such as einhundertzweiundsiebzig): the same `group` number gets the same colour and
// `connector:true` (linking pieces like `und`) stays faded — so the eye sees the word
// as a sequence of blocks read together, not one undifferentiated block.
type ChunkPart = { text: string; group?: number; connector?: boolean }
type ChunkTones = string[]
const CHUNK_TONES: ChunkTones = [
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
  'bg-rose-100 text-rose-800',
]
type Cell = string | [string, string] | { chunks: ChunkPart[]; sub?: string }

// A row's identity for row-level favourites: its main cell values joined. The star sits
// in the FIRST cell on purpose — a wide table scrolls horizontally on mobile, so the last
// column may be off-screen.
const cellText = (cell: Cell): string =>
  typeof cell === 'string'
    ? cell
    : Array.isArray(cell)
      ? cell[0]
      : cell.chunks.map((c) => c.text).join('')
const rowText = (row: Cell[]) => row.map(cellText).join(' · ')

export function FormTable({
  head,
  rows,
  note,
  speakCols,
  minW = '30rem',
}: {
  head: string[]
  rows: Cell[][]
  note?: string
  speakCols?: number[]
  minW?: string
}) {
  const fav = useRowFavorites()
  const visible = rows.filter((row) => fav.shows(rowText(row)))
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth: minW }}>
        <thead>
          <tr className="border-b border-gray-300 text-gray-500">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={rowText(row)} className="border-b border-gray-100 align-top">
              {row.map((cell, i) => {
                const isChunked = typeof cell === 'object' && !Array.isArray(cell)
                const [main, sub] = isChunked
                  ? [cell.chunks, cell.sub]
                  : Array.isArray(cell)
                    ? cell
                    : [cell]
                return (
                  <td
                    key={i}
                    className={
                      i === 0 ? 'py-2 pr-3 font-semibold text-brand-700' : 'py-2 pr-3 text-gray-800'
                    }
                  >
                    {i === 0 && fav.save(rowText(row))}
                    {isChunked ? (
                      <span className="inline-flex flex-wrap items-center gap-1">
                        {(main as ChunkPart[]).map((c, ci) => (
                          <span
                            key={ci}
                            className={`rounded px-1 py-0.5 ${
                              c.connector ? 'text-gray-400' : CHUNK_TONES[(c.group ?? ci) % CHUNK_TONES.length]
                            }`}
                          >
                            {c.text}
                          </span>
                        ))}
                        {speakCols?.includes(i) && (
                          <SpeakButton text={(main as ChunkPart[]).map((c) => c.text).join('')} />
                        )}
                      </span>
                    ) : (
                      <>
                        {main as string}
                        {main && speakCols?.includes(i) && <SpeakButton text={main as string} />}
                      </>
                    )}
                    {sub && <span className="block text-xs text-gray-400">{sub}</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </div>
  )
}

// ——— Verbs & tenses (each reads data from its own file) ———

// Verb table (mobile friendly): the verb, one form of it (`formKey`, or the participle
// headed by an auxiliary's form) and its meaning — Partizip II / Perfekt / Präteritum.
export function VerbTable({
  source,
  group,
  head,
  formKey = 'partizip',
  aux,
  withEmoji,
}: {
  source: string
  group: string
  head: string
  formKey?: string
  /** An auxiliary named in language.json → auxiliaries; its form heads the participle. */
  aux?: string
  withEmoji?: boolean
}) {
  const fav = useRowFavorites()
  const rows = sourceRows<VerbRow>(source, group).filter((row) => fav.shows(row.verb))
  const auxForm = aux ? (language.auxiliaries?.[aux] ?? aux) : ''
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-300 text-sm text-gray-500">
            <th className="py-2 pr-4 font-medium">Fiil</th>
            <th className="py-2 pr-4 font-medium">{head}</th>
            <th className="py-2 pr-4 font-medium">{t.lesson.meaning}</th>
            <th className="hidden py-2 font-medium sm:table-cell">{t.lesson.exampleSentence}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const mid = aux ? `${auxForm} ${row.partizip}` : String((row as Record<string, unknown>)[formKey] ?? '')
            return (
              <Fragment key={row.verb}>
                <tr className="align-top sm:border-b sm:border-gray-100">
                  <td className="py-2 pr-4 sm:whitespace-nowrap">
                    {fav.save(row.verb)}
                    {withEmoji && <span className="mr-1 inline-block w-7 text-xl">{row.emoji ?? ''}</span>}
                    {row.verb}
                    <SpeakButton text={row.verb} />
                  </td>
                  <td className="py-2 pr-4 font-semibold text-brand-700 sm:whitespace-nowrap">
                    {mid}
                    <SpeakButton text={mid} />
                  </td>
                  <td className="py-2 text-gray-600 sm:pr-4">
                    {row.tr} <span className="text-sm text-gray-400">· {row.en}</span>
                  </td>
                  <td className="hidden py-2 text-sm sm:table-cell">
                    <div className="italic text-gray-700">
                      {row.example.de}
                      <SpeakButton text={row.example.de} />
                    </div>
                    <div className="text-gray-500">{row.example.tr}</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 sm:hidden">
                  <td colSpan={3} className={withEmoji ? 'pb-2 pl-8 text-sm' : 'pb-2 pl-4 text-sm'}>
                    <span className="italic text-gray-700">
                      {row.example.de}
                      <SpeakButton text={row.example.de} />
                    </span>
                    <div className="text-gray-500">{row.example.tr}</div>
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Small table cards side by side: each box renders one source group (conjugation
// lists, clock tables…). The ORDER of the row fields decides the layout: field 1 is
// the faded left column (pronoun, time), field 2 the main German value (with speak
// button), and field 3, if present, the Turkish line beneath it. That way {pron,form}
// and {time,de,tr} render through the same component.
type CardRow = Record<string, string>
export function TableCards({
  boxes,
}: {
  boxes: { title: string; note?: string; tone?: 'amber'; source: string; group: string }[]
}) {
  const fav = useRowFavorites()
  // A row's key carries its box title: the same pronoun repeats in every box.
  const key = (box: { title: string }, left: string) => `${box.title} · ${left}`
  const visibleRows = (box: { title: string; source: string; group: string }) =>
    sourceRows<CardRow>(box.source, box.group).filter((row) =>
      fav.shows(key(box, Object.values(row)[0])),
    )
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      {boxes.filter((box) => visibleRows(box).length > 0).map((box) => {
        const tinted = box.tone === 'amber'
        return (
          <div
            key={box.title}
            className={`rounded-lg border p-4 ${tinted ? 'border-brand-200 bg-brand-50' : 'border-gray-200 bg-white'}`}
          >
            <p className="font-semibold text-brand-700">{box.title}</p>
            {box.note && <p className="text-xs text-gray-500">{box.note}</p>}
            <table className="mt-2 w-full text-left text-sm">
              <tbody>
                {visibleRows(box).map((row) => {
                  const [left, main, sub] = Object.values(row)
                  return (
                    <tr
                      key={left}
                      className={`border-b last:border-0 ${tinted ? 'border-brand-100' : 'border-gray-100'}`}
                    >
                      <td className="py-1.5 pr-4 text-gray-500">
                        {fav.save(key(box, left))}
                        {left}
                      </td>
                      <td className="py-1.5">
                        <span className="font-medium">{main}</span>
                        <SpeakButton text={main} />
                        {sub && <span className="block text-xs text-gray-500">{sub}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

// Modal verb cards (Präsens or Präteritum conjugation).
export function ModalCards({ source, showPraet }: { source: string; showPraet?: boolean }) {
  const fav = useRowFavorites()
  const modals = sourceRows<ModalRow>(source, 'modals').filter((m) => fav.shows(m.verb))
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      {modals.map((m) => (
        <div key={m.verb} className="rounded-lg border border-gray-200 bg-white p-4">
          {fav.save(m.verb)}
          <div className="flex items-baseline gap-2">
            {showPraet ? (
              <>
                <span className="font-semibold text-gray-500">{m.verb}</span>
                <span className="text-gray-400">→</span>
                <span className="text-lg font-bold text-brand-700">{m.praet}</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-brand-700">{m.verb}</span>
                <span className="text-sm text-gray-500">
                  {m.tr} · {m.en}
                </span>
              </>
            )}
          </div>
          {showPraet && (
            <p className="text-xs text-gray-500">
              {m.tr} · {m.en}
            </p>
          )}
          <table className="mt-2 w-full text-left text-sm">
            <tbody>
              {m.conj.map((form: string, i: number) => (
                <tr key={PERSONS[i]} className="border-b border-gray-100 last:border-0">
                  <td className="py-1 pr-3 text-gray-500">{PERSONS[i]}</td>
                  <td className="py-1 font-medium">{form}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm">
            <span className="italic text-gray-700">
              {m.example.de}
              <SpeakButton text={m.example.de} />
            </span>
            <span className="block text-gray-500">{m.example.tr}</span>
          </p>
        </div>
      ))}
    </div>
  )
}

// "Reveal the answer" exercises. Two data shapes: {q,a} or {verb,tr,en,answer}.
export function RevealExercises({ source }: { source: string }) {
  const items = sourceRows<ExerciseRow>(source, 'exercises')
  const { isRevealed, toggle } = useRevealed()
  const isVerb = items[0] !== undefined && 'verb' in items[0]
  if (isVerb) {
    return (
      <ul className="mt-3 space-y-2">
        {items.map((ex, i) => (
          <li
            key={ex.verb}
            className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <span>
              {ex.verb}{' '}
              <span className="text-sm text-gray-500">
                ({[gloss(ex), secondGloss(ex)].filter(Boolean).join(' · ')})
              </span>
            </span>
            {isRevealed(i) ? (
              <span className="font-semibold text-green-700">
                {ex.answer}
                <SpeakButton text={ex.answer ?? ''} />
              </span>
            ) : (
              <button
                onClick={() => toggle(i)}
                className="shrink-0 rounded bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 hover:bg-brand-200"
              >
                {t.lesson.showAnswer}
              </button>
            )}
          </li>
        ))}
      </ul>
    )
  }
  // The {q,a} shape is identical to the `reveal` block in the lesson JSON — same component.
  return <Reveal items={items as { q: string; a: string }[]} />
}

// Wortbildung table: derivation/compounding → noun → meaning.
// Rows arrive either directly (`rows`) or from a data file (`source` + `group`); the
// latter is preferred, since it avoids copying the same list into the lesson document.
type WordTableRow = { base?: string; parts?: string; noun: string; tr: string; en: string }
export function WordTable({
  leftHead,
  midHead = t.lesson.noun,
  rows,
  source,
  group,
}: {
  leftHead: string
  midHead?: string
  rows?: WordTableRow[]
  source?: string
  group?: string
}) {
  const fav = useRowFavorites()
  const all = rows ?? (source && group ? sourceRows<WordTableRow>(source, group) : [])
  const data = all.filter((r) => fav.shows(r.noun))
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-gray-500">
            <th className="py-2 pr-4 font-medium">{leftHead}</th>
            <th className="py-2 pr-4 font-medium">{midHead}</th>
            <th className="py-2 font-medium">{t.lesson.meaning}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.noun} className="border-b border-gray-100">
              <td className="py-2 pr-4 text-gray-600">
                {fav.save(r.noun)}
                {r.base ?? r.parts}
              </td>
              <td className="py-2 pr-4 font-semibold text-brand-700">
                {r.noun}
                <SpeakButton text={r.noun} />
              </td>
              <td className="py-2 text-gray-600">
                {gloss(r)}{' '}
                {secondGloss(r) && <span className="text-gray-400">· {secondGloss(r)}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type EmailSampleLine = { de: string; tr?: string }
type EmailSample = { subject: string; subjectTr?: string; lines: EmailSampleLine[] }

// Full e-mail samples at the end of a lesson (see the e-mail writing lesson). Reads
// the source's `emails` array; every mail renders as one card.
export function EmailSamples({ source, group = 'emails' }: { source: string; group?: string }) {
  const fav = useRowFavorites()
  const emails = sourceRows<EmailSample>(source, group).filter((m) => fav.shows(m.subject))
  return (
    <div className="mt-4 space-y-6">
      {emails.map((mail) => (
        <div
          key={mail.subject}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
            <span aria-hidden>✉️</span>
            <div className="min-w-0 flex-1">
              {fav.save(mail.subject)}
              <p className="text-sm font-semibold text-gray-800">
                {language.emailSubject}: {mail.subject}
              </p>
              {mail.subjectTr && <p className="text-xs text-gray-500">{mail.subjectTr}</p>}
            </div>
          </div>
          <div className="space-y-2.5 px-4 py-3">
            {mail.lines.map((ln, i) => (
              <p key={i} className="text-sm">
                <span className="italic text-gray-700">{ln.de}</span>
                <SpeakButton text={ln.de} />
                {ln.tr && <span className="block text-xs text-gray-500">{ln.tr}</span>}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
