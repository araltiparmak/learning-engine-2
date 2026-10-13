import { useId } from 'react'
import SpeakButton from '../SpeakButton'
import { useRowFavorites } from '../rowFavorites'

// Driving directions drawn as tiny top-down maps, one card per phrase. The car (blue)
// always starts at the bottom in the right-hand lane and the accent line is the route the
// phrase asks for. Street maps have two side streets — 1 = die nächste, 2 = die
// übernächste — so "next" vs "the one after" is visible at a glance; the roundabout map
// numbers its exits in driving order (counter-clockwise, right-hand traffic).
// Built for the driving test lesson; the rows are written inline in the lesson JSON.
type Move = 'right' | 'left' | 'straight' | 'uturn' | 'pullover' | 'roundabout'

type Row = {
  de: string
  tr: string
  move: Move
  street?: 1 | 2
  exit?: 1 | 2 | 3
  note?: string
}

// y of the side streets' centre lines: 1 = nearest to the car, 2 = the one after.
const STREET_Y = { 1: 62, 2: 24 }
// Roundabout geometry: centre, radius of the driving lane, and where each exit leaves
// the ring (the right-hand lane of that arm) plus where the arm ends at the map edge.
const RING = { cx: 40, cy: 50, r: 19 }
const EXITS = {
  1: { x: 58.3, y: 55, end: 'L80 55', large: 0 },
  2: { x: 45, y: 31.7, end: 'L45 0', large: 0 },
  3: { x: 21.7, y: 45, end: 'L0 45', large: 1 },
}

function routePath(row: Row): string {
  const start = 'M45 88'
  switch (row.move) {
    case 'straight':
      return `${start} L45 4`
    case 'uturn':
      return `${start} L45 50 Q45 40 40 40 Q35 40 35 50 L35 94`
    case 'pullover':
      return `${start} L45 62 Q45 54 48 50 L48 38`
    case 'right': {
      const y = STREET_Y[row.street ?? 1] + 3.5
      return `${start} L45 ${y + 7} Q45 ${y} 52 ${y} L78 ${y}`
    }
    case 'left': {
      const y = STREET_Y[row.street ?? 1] - 3.5
      return `${start} L45 ${y + 6} Q45 ${y} 38 ${y} L2 ${y}`
    }
    case 'roundabout': {
      const e = EXITS[row.exit ?? 1]
      return `${start} L45 68.3 A${RING.r} ${RING.r} 0 ${e.large} 0 ${e.x} ${e.y} ${e.end}`
    }
  }
}

function Map({ row }: { row: Row }) {
  const marker = useId()
  const road = 'fill-gray-200'
  const label = 'fill-gray-400 text-[7px] font-semibold'
  return (
    <svg viewBox="0 0 80 100" className="h-24 w-20 shrink-0" aria-hidden="true">
      {row.move === 'roundabout' ? (
        <>
          <rect x="30" y="69" width="20" height="31" className={road} />
          <rect x="59" y="40" width="21" height="20" className={road} />
          <rect x="30" y="0" width="20" height="31" className={road} />
          <rect x="0" y="40" width="21" height="20" className={road} />
          <circle cx={RING.cx} cy={RING.cy} r={RING.r} strokeWidth="14" className="fill-none stroke-gray-200" />
          <circle cx={RING.cx} cy={RING.cy} r="11" className="fill-emerald-100" />
          <text x="74" y="37" className={label}>1</text>
          <text x="54" y="8" className={label}>2</text>
          <text x="2" y="37" className={label}>3</text>
        </>
      ) : (
        <>
          <rect x="30" y="0" width="20" height="100" className={road} />
          {row.move !== 'pullover' &&
            ([1, 2] as const).map((n) => (
              <g key={n}>
                <rect x="0" y={STREET_Y[n] - 7} width="80" height="14" className={road} />
                <text x="73" y={STREET_Y[n] - 9} className={label}>{n}</text>
              </g>
            ))}
          <line x1="40" y1="0" x2="40" y2="100" strokeDasharray="4 4" className="stroke-white" />
        </>
      )}
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-brand-500" />
        </marker>
      </defs>
      <path
        d={routePath(row)}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${marker})`}
        className="fill-none stroke-brand-500"
      />
      <rect x="42" y="88" width="6" height="9" rx="1.5" className="fill-sky-600" />
    </svg>
  )
}

export default function TurnDiagram({ items }: { items: Row[] }) {
  const fav = useRowFavorites()
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {items
        .filter((row) => fav.shows(row.de))
        .map((row) => (
          <li key={row.de} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
            {fav.save(row.de)}
            <Map row={row} />
            <div className="min-w-0 text-sm">
              <p className="italic text-gray-800">
                {row.de}
                <SpeakButton text={row.de} />
              </p>
              <p className="mt-0.5 text-gray-500">{row.tr}</p>
              {row.note && <p className="mt-1 text-xs text-brand-700">{row.note}</p>}
            </div>
          </li>
        ))}
    </ul>
  )
}
