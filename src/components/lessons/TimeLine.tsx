import SpeakButton from '../SpeakButton'
import { useRowFavorites } from '../rowFavorites'

// A small time axis per row: five cells from the past through "now" (the middle cell)
// into the future, and a bar over the stretch the phrase covers. A single filled cell is
// a point in time (vor zwei Jahren), a run of cells is a span (seit zwei Jahren reaches
// from the past up to now). `open` adds an arrow for spans with no end (ab Montag).
// Built for the time prepositions lesson; the rows are written inline in the lesson JSON.
const ZONES = ['geçmiş', '', 'şimdi', '', 'gelecek']
const NOW = 2

type Row = {
  head: string
  de: string
  tr: string
  from: number
  to?: number
  open?: boolean
  note?: string
}

export default function TimeLine({ items }: { items: Row[] }) {
  const fav = useRowFavorites()
  return (
    <div className="mt-3">
      {/* Same shape as the bar row below (grid + arrow column) so the labels line up. */}
      <div className="flex gap-1 px-4">
        <div className="grid flex-1 grid-cols-5 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[11px]">
          {ZONES.map((zone, i) => (
            <span key={i} className={i === NOW ? 'text-brand-600' : undefined}>
              {zone}
            </span>
          ))}
        </div>
        <span className="w-3" />
      </div>
      <ul className="mt-2 space-y-2">
        {items
          .filter((row) => fav.shows(row.de))
          .map((row) => {
            const to = row.to ?? row.from
            return (
              <li key={row.de} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                {fav.save(row.de)}
                <div className="flex items-center gap-1">
                  <div className="grid flex-1 grid-cols-5 gap-1">
                    {ZONES.map((_, i) => {
                      const filled = i >= row.from && i <= to
                      return (
                        <span
                          key={i}
                          className={`h-2 rounded-full ${
                            filled ? 'bg-brand-500' : i === NOW ? 'bg-brand-100' : 'bg-gray-100'
                          }`}
                        />
                      )
                    })}
                  </div>
                  <span className={`w-3 text-xs ${row.open ? 'text-brand-500' : 'text-transparent'}`}>
                    →
                  </span>
                </div>
                <p className="mt-2.5 text-sm">
                  <span className="font-semibold text-brand-700">{row.head}</span>
                  <span className="ml-2 italic text-gray-800">
                    {row.de}
                    <SpeakButton text={row.de} />
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-gray-500">{row.tr}</p>
                {row.note && <p className="mt-1 text-xs text-brand-700">{row.note}</p>}
              </li>
            )
          })}
      </ul>
    </div>
  )
}
