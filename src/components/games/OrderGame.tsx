import { useState } from 'react'
import SpeakButton from '../SpeakButton'
import { shuffle } from '../../lib/shuffle'
import type { GameItem, OrderGame as OrderGameDef } from '../../lib/games'
import {
  DragChip,
  DropZone,
  GameDone,
  GameHud,
  sample,
  useGameRun,
  useWrongFlash,
  zoneDone,
  zoneIdle,
  type GameNav,
} from './common'

// Ordering: numbered slots, one per item, filled from a shuffled pile. The item order in
// the data IS the answer (Montag first, Januar first, eins first).
function OrderGame({ game, items, ...nav }: GameNav & { game: OrderGameDef; items: GameItem[] }) {
  const [round] = useState(() => {
    const chosen = sample(items, game.count)
    return { slots: chosen, pile: shuffle(chosen) }
  })
  const [placed, setPlaced] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)
  const [wrong, flash] = useWrongFlash()
  const run = useGameRun()
  const total = round.slots.length

  const place = (itemId: string, slotId: string) => {
    setSelected(null)
    if (itemId !== slotId) {
      run.miss()
      flash(itemId)
      return
    }
    run.hit()
    const next = new Set(placed).add(itemId)
    setPlaced(next)
    if (next.size === total) run.finish()
  }

  const cols = total <= 7 ? 'sm:grid-cols-7' : total <= 8 ? 'sm:grid-cols-4' : 'sm:grid-cols-6'

  if (run.seconds !== null) return <GameDone run={run} {...nav} />

  return (
    <div>
      <GameHud run={run} done={placed.size} total={total} />
      <div className={`mt-4 flex-wrap gap-2.5 ${placed.size < total ? 'flex min-h-12' : 'hidden'}`}>
        {round.pile
          .filter((item) => !placed.has(item.id))
          .map((item) => (
            <DragChip
              key={item.id}
              tone={items.indexOf(item)}
              selected={selected === item.id}
              wrong={wrong === item.id}
              onTap={() => setSelected(selected === item.id ? null : item.id)}
              onDrop={(slotId) => place(item.id, slotId)}
            >
              {item.de}
            </DragChip>
          ))}
      </div>
      <ol className={`mt-5 grid grid-cols-2 gap-2.5 ${cols}`}>
        {round.slots.map((item, i) => {
          const done = placed.has(item.id)
          return (
            <li key={item.id}>
              <DropZone
                id={item.id}
                active={!done}
                onTap={() => selected && place(selected, item.id)}
                className={`flex h-full min-h-20 flex-col rounded-2xl px-3 py-2 ${done ? zoneDone : zoneIdle}`}
              >
                <span
                  className={`text-xl font-black tabular-nums ${done ? 'text-emerald-800' : 'text-white/40'}`}
                >
                  {i + 1}
                </span>
                {done && (
                  <span className="flex flex-wrap items-center text-lg font-bold">
                    {item.de}
                    <SpeakButton text={item.speak ?? item.de} />
                  </span>
                )}
              </DropZone>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default OrderGame
