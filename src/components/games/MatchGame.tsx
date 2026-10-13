import { useState } from 'react'
import SpeakButton from '../SpeakButton'
import { shuffle } from '../../lib/shuffle'
import { itemText, type GameItem, type MatchGame as MatchGameDef } from '../../lib/games'
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

// Pairing: the left side's boxes go onto the right side's cards. Both columns are
// shuffled on their own, so position gives nothing away.
function MatchGame({ game, items, ...nav }: GameNav & { game: MatchGameDef; items: GameItem[] }) {
  const [round] = useState(() => {
    const chosen = sample(items, game.count)
    return { left: shuffle(chosen), right: shuffle(chosen) }
  })
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)
  const [wrong, flash] = useWrongFlash()
  const run = useGameRun()
  const total = round.left.length

  const place = (itemId: string, cardId: string) => {
    setSelected(null)
    if (itemId !== cardId) {
      run.miss()
      flash(itemId)
      return
    }
    run.hit()
    const next = new Set(matched).add(itemId)
    setMatched(next)
    if (next.size === total) run.finish()
  }

  if (run.seconds !== null) return <GameDone run={run} {...nav} />

  return (
    <div>
      <GameHud run={run} done={matched.size} total={total} />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-6">
        <div className="flex flex-col gap-2.5">
          {round.left.map((item) =>
            matched.has(item.id) ? (
              <span
                key={item.id}
                className="flex min-h-12 items-center rounded-2xl border-2 border-dashed border-white/10 px-4 py-2.5 text-lg font-bold text-white/20"
              >
                {itemText(item, game.left)}
              </span>
            ) : (
              <DragChip
                key={item.id}
                tone={items.indexOf(item)}
                selected={selected === item.id}
                wrong={wrong === item.id}
                onTap={() => setSelected(selected === item.id ? null : item.id)}
                onDrop={(cardId) => place(item.id, cardId)}
              >
                {itemText(item, game.left)}
              </DragChip>
            ),
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {round.right.map((item) => {
            const done = matched.has(item.id)
            return (
              <DropZone
                key={item.id}
                id={item.id}
                active={!done}
                onTap={() => selected && place(selected, item.id)}
                className={`flex min-h-12 items-center rounded-2xl px-4 py-2.5 text-lg font-semibold ${
                  done ? zoneDone : zoneIdle
                }`}
              >
                {done ? (
                  <span className="flex flex-wrap items-center gap-x-1.5">
                    <span className="font-bold">{item.de}</span>
                    <SpeakButton text={item.speak ?? item.de} />
                    <span className="text-base font-medium text-emerald-900">
                      · {itemText(item, game.right === 'de' ? game.left : game.right)}
                    </span>
                  </span>
                ) : (
                  itemText(item, game.right)
                )}
              </DropZone>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MatchGame
