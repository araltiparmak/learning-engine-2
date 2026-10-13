import SpeakButton from '../SpeakButton'
import { sourceRows } from '../../data/sources'
import { useRowFavorites } from '../rowFavorites'

// The poster wall of the "Afiş Dersi" lesson. Each film title is drawn as a typographic
// poster instead of the copyrighted artwork: the title is set in our own type and the
// words that carry the grammar rule are highlighted, so the poster teaches rather than
// decorates. The 4:5 frame matches the aspect the same cards are exported at for social.
type Part = { t: string; mark?: boolean }
type Poster = { year: string; level: string; parts: Part[]; sub?: string }
type Row = {
  head: string
  use?: string
  note?: string
  poster: Poster
  examples?: { de: string; tr: string }[]
}

// The parts joined back together are the spoken title, so they must concatenate into
// the exact title text — that string is what the pre-rendered audio was hashed from.
const spoken = (p: Poster) => p.parts.map((x) => x.t).join('')

export default function PosterWall({ source, group }: { source: string; group: string }) {
  const rows = sourceRows<Row>(source, group)
  const fav = useRowFavorites()
  return (
    <div className="mt-4 grid gap-6 sm:grid-cols-2">
      {rows
        .filter((r) => fav.shows(r.head))
        .map((r) => (
          <article key={r.head}>
            {fav.save(r.head)}
            <div className="flex aspect-[4/5] flex-col justify-between rounded-lg bg-stone-900 p-5">
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-stone-900">
                  {r.poster.level}
                </span>
                <span className="text-xs tabular-nums text-stone-400">{r.poster.year}</span>
              </div>
              <h3 className="text-2xl font-semibold leading-[1.15] tracking-tight text-stone-50">
                {r.poster.parts.map((x, i) => (
                  <span key={i} className={x.mark ? 'text-amber-300' : undefined}>
                    {x.t}
                  </span>
                ))}
              </h3>
              <div className="flex items-end justify-between gap-3">
                <span className="text-[11px] uppercase tracking-widest text-stone-400">
                  {r.poster.sub}
                </span>
                <span className="shrink-0 text-stone-300">
                  <SpeakButton text={spoken(r.poster)} />
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-700">{r.use}</p>
            {r.examples?.map((ex) => (
              <p key={ex.de} className="mt-2 text-sm">
                <span className="italic text-gray-700">
                  {ex.de}
                  <SpeakButton text={ex.de} />
                </span>
                <span className="block text-gray-500">{ex.tr}</span>
              </p>
            ))}
            {r.note && <p className="mt-2 text-xs text-brand-700">{r.note}</p>}
          </article>
        ))}
    </div>
  )
}
