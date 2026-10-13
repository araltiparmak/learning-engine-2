import { useState } from 'react'
import SpeakButton from '../SpeakButton'
import { shuffle } from '../../lib/shuffle'
import { gloss } from '../../i18n'
import type { GameItem, SortGame as SortGameDef } from '../../lib/games'
import {
  DragChip,
  DropZone,
  GameDone,
  GameHud,
  useGameRun,
  useWrongFlash,
  zoneIdle,
  type GameNav,
} from './common'

// Sorting: a few labelled boxes, every item belongs in the one its `group` names.
function SortGame({ game, items, ...nav }: GameNav & { game: SortGameDef; items: GameItem[] }) {
  const [pile] = useState(() => shuffle(items.filter((item) => item.group)))
  const [placed, setPlaced] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)
  const [wrong, flash] = useWrongFlash()
  const run = useGameRun()
  const total = pile.length

  const place = (itemId: string, bucketId: string) => {
    setSelected(null)
    const item = pile.find((i) => i.id === itemId)
    if (item?.group !== bucketId) {
      run.miss()
      flash(itemId)
      return
    }
    run.hit()
    const next = new Set(placed).add(itemId)
    setPlaced(next)
    if (next.size === total) run.finish()
  }

  if (run.seconds !== null) return <GameDone run={run} {...nav} />

  return (
    <div>
      <GameHud run={run} done={placed.size} total={total} />
      <div className={`mt-4 flex-wrap gap-2.5 ${placed.size < total ? 'flex min-h-12' : 'hidden'}`}>
        {pile
          .filter((item) => !placed.has(item.id))
          .map((item) => (
            <DragChip
              key={item.id}
              tone={items.indexOf(item)}
              selected={selected === item.id}
              wrong={wrong === item.id}
              onTap={() => setSelected(selected === item.id ? null : item.id)}
              onDrop={(bucketId) => place(item.id, bucketId)}
            >
              {item.de}
            </DragChip>
          ))}
      </div>
      <div
        className={`mt-5 grid gap-3 ${game.buckets.length > 2 ? 'sm:grid-cols-3' : 'grid-cols-2'}`}
      >
        {game.buckets.map((bucket) => (
          <DropZone
            key={bucket.id}
            id={bucket.id}
            active={placed.size < total}
            onTap={() => selected && place(selected, bucket.id)}
            className={`min-h-44 rounded-2xl p-4 ${zoneIdle}`}
          >
            <p className="text-xl font-black">{bucket.de}</p>
            <p className="text-sm text-white/60">{gloss(bucket)}</p>
            {/* Taps on a placed word's speak button must not count as a tap on the box. */}
            <ul className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              {pile
                .filter((item) => placed.has(item.id) && item.group === bucket.id)
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center rounded-xl border-b-4 border-emerald-700 bg-emerald-400 px-3 py-1.5 text-base font-bold text-emerald-950 motion-safe:animate-pop"
                  >
                    {item.de}
                    <SpeakButton text={item.speak ?? item.de} />
                  </li>
                ))}
            </ul>
          </DropZone>
        ))}
      </div>
    </div>
  )
}

export default SortGame
