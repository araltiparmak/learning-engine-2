import SpeakButton from '../SpeakButton'
import { sourceRows } from '../../data/sources'
import { useRowFavorites } from '../rowFavorites'

// List pieces written for the English lessons (their target line is `en`): called by
// name from a `component` block in the JSON (see ./index.ts). Data is read from
// content/<target>/sources/. Like every block, each enters a build only when that
// target's content uses it.

// A list of English example sentences (+ Turkish meaning, optional note).
export function PatternList({ source, group }: { source: string; group: string }) {
  const fav = useRowFavorites()
  const items = sourceRows<{ en: string; tr: string; note?: string }>(source, group).filter(
    (item) => fav.shows(item.en),
  )
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item.en} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          {fav.save(item.en)}
          <p className="italic text-gray-800">
            {item.en}
            <SpeakButton text={item.en} />
          </p>
          <p className="mt-0.5 text-sm text-gray-500">{item.tr}</p>
          {item.note && <p className="mt-1.5 text-sm text-brand-800">💡 {item.note}</p>}
        </li>
      ))}
    </ul>
  )
}

// Term/phrase + meaning + example sentence (phrasal verb / collocation).
export function TermList({ source, group }: { source: string; group: string }) {
  const fav = useRowFavorites()
  const items = (
    sourceRows<{ term: string; tr: string; example: { en: string; tr: string }; note?: string }>(source, group)
  ).filter((item) => fav.shows(item.term))
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item.term} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          {fav.save(item.term)}
          <p>
            <span className="font-semibold text-brand-700">{item.term}</span>
            <SpeakButton text={item.term} />
            <span className="text-gray-700"> — {item.tr}</span>
          </p>
          <p className="mt-1 text-sm italic text-gray-700">
            {item.example.en}
            <SpeakButton text={item.example.en} />
          </p>
          <p className="text-sm text-gray-500">{item.example.tr}</p>
          {item.note && <p className="mt-1.5 text-sm text-brand-800">💡 {item.note}</p>}
        </li>
      ))}
    </ul>
  )
}

// The typical mistake a Turkish speaker makes, its correct form and the reason. The
// counterpart of SpeechMistakes on the German side; items are written inline in the
// lesson JSON, not in a source file.
export function MistakeList({
  items,
}: {
  items: { wrong: string; right: string; why: string }[]
}) {
  const fav = useRowFavorites()
  return (
    <div className="mt-3 space-y-2">
      {items.filter((m) => fav.shows(m.wrong)).map((m) => (
        <div key={m.wrong} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
          {fav.save(m.wrong)}
          <p className="text-red-700 line-through decoration-red-300">❌ {m.wrong}</p>
          <p className="mt-1 font-medium text-green-800">
            ✅ {m.right}
            <SpeakButton text={m.right} />
          </p>
          <p className="mt-1 text-gray-600">{m.why}</p>
        </div>
      ))}
    </div>
  )
}

// The four zones of the time axis a tense can sit on. A row fills the cells between
// its `from` and `to` index, so a tense is read as a span, not a single point.
const TIME_ZONES = ['Geçmişin geçmişi', 'Geçmiş', 'Şimdi', 'Gelecek']

// A tense placed on that axis: filled track + sentence + meaning. `ghost` fades the
// track for a tense whose action never actually happened (would have gone).
export function TimeTravel({ source, group }: { source: string; group: string }) {
  const fav = useRowFavorites()
  const items = (
    sourceRows<{
      en: string
      tr: string
      tense?: string
      dial?: string
      from?: number
      to?: number
      ghost?: boolean
      note?: string
    }>(source, group)
  ).filter((item) => fav.shows(item.en))
  return (
    <div className="mt-3">
      <div className="grid grid-cols-4 gap-1 px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[11px]">
        {TIME_ZONES.map((zone, i) => (
          <span key={zone} className={i === 2 ? 'text-brand-600' : undefined}>
            {zone}
          </span>
        ))}
      </div>
      <ul className="mt-2 space-y-2">
        {items.map((item) => {
          const from = item.from ?? 1
          const to = item.to ?? from
          return (
            <li key={item.en} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              {fav.save(item.en)}
              <div className="grid grid-cols-4 gap-1">
                {TIME_ZONES.map((zone, i) => {
                  const filled = i >= from && i <= to
                  return (
                    <span
                      key={zone}
                      className={`h-2 rounded-full ${
                        filled ? (item.ghost ? 'bg-brand-200' : 'bg-brand-500') : 'bg-gray-100'
                      }`}
                    />
                  )
                })}
              </div>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {item.tense && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-600">
                    {item.tense}
                  </span>
                )}
                {item.dial && <span className="text-brand-700">🕰️ {item.dial}</span>}
              </p>
              <p className="mt-1.5 italic text-gray-800">
                {item.en}
                <SpeakButton text={item.en} />
              </p>
              <p className="mt-0.5 text-sm text-gray-500">{item.tr}</p>
              {item.note && <p className="mt-1.5 text-sm text-brand-800">💡 {item.note}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Frequency adverbs drawn as a scale: how much of the week the word actually claims.
export function FrequencyBar({
  items,
}: {
  items: { word: string; pct: number; tr: string; example?: string }[]
}) {
  const fav = useRowFavorites()
  return (
    <ul className="mt-3 space-y-2.5">
      {items.filter((item) => fav.shows(item.word)).map((item) => (
        <li key={item.word}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {item.word}
              <span className="ml-1.5 font-normal text-gray-500">{item.tr}</span>
            </span>
            <span className="shrink-0 text-xs tabular-nums text-gray-400">
              %{item.pct}
              {fav.save(item.word, { inline: true })}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-brand-500"
              style={{ width: `${Math.max(item.pct, 2)}%` }}
            />
          </div>
          {item.example && (
            <p className="mt-1 text-sm italic text-gray-600">
              {item.example}
              <SpeakButton text={item.example} />
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

// Blunt → softened rewrite (before/after).
export function RewriteList({ source, group }: { source: string; group: string }) {
  const fav = useRowFavorites()
  const items = (
    sourceRows<{ direct: string; softened: string; tr: string }>(source, group)
  ).filter((item) => fav.shows(item.direct))
  return (
    <ul className="mt-3 space-y-3">
      {items.map((item) => (
        <li key={item.direct} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          {fav.save(item.direct)}
          <p className="text-sm text-rose-700">
            <span className="mr-1.5 font-semibold">✗ Sert:</span>
            <span className="italic">{item.direct}</span>
          </p>
          <p className="mt-1.5 text-sm text-green-700">
            <span className="mr-1.5 font-semibold">✓ Yumuşak:</span>
            <span className="italic">{item.softened}</span>
            <SpeakButton text={item.softened} />
          </p>
          <p className="mt-1 text-sm text-gray-500">{item.tr}</p>
        </li>
      ))}
    </ul>
  )
}
