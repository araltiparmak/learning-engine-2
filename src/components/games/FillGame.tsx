import { useState } from 'react'
import SpeakButton from '../SpeakButton'
import { shuffle } from '../../lib/shuffle'
import { gloss, t } from '../../i18n'
import type { FillGame as FillGameDef } from '../../lib/games'
import {
  DragChip,
  DropZone,
  GameDone,
  GameHud,
  sample,
  keyButton,
  useGameRun,
  useWrongFlash,
  zoneDone,
  zoneIdle,
  type GameNav,
} from './common'

const BLANK = '___'

// One sentence at a time with a gap; the right box goes into the gap. A wrong box shakes
// and stays crossed out, so the second try is never a blind repeat.
function FillGame({ game, ...nav }: GameNav & { game: FillGameDef }) {
  const [questions] = useState(() =>
    shuffle(sample(game.questions, game.count)).map((q) => ({
      ...q,
      options: shuffle([q.correct, ...q.wrong]),
    })),
  )
  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [tried, setTried] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<string | null>(null)
  const [wrong, flash] = useWrongFlash()
  const run = useGameRun()

  const q = questions[index]
  const last = index === questions.length - 1
  const [before, after] = q.sentence.split(BLANK)
  const full = q.sentence.replace(BLANK, q.correct)

  const place = (option: string) => {
    setSelected(null)
    if (option !== q.correct) {
      run.miss()
      flash(option)
      setTried(new Set(tried).add(option))
      return
    }
    run.hit()
    setAnswered(true)
  }

  const next = () => {
    if (last) {
      run.finish()
      return
    }
    setIndex(index + 1)
    setAnswered(false)
    setTried(new Set())
  }

  if (run.seconds !== null) {
    return <GameDone run={run} {...nav} />
  }

  return (
    <div>
      <GameHud run={run} done={index + (answered ? 1 : 0)} total={questions.length} />
      <div className="mt-4 rounded-2xl bg-white/5 p-5 sm:p-6">
        <div className="text-xl leading-[2.6rem] font-semibold text-white sm:text-2xl sm:leading-[3rem]">
          {before}
          <DropZone
            id="blank"
            active={!answered}
            label={t.games.blank}
            onTap={() => selected && place(selected)}
            className={`mx-1 inline-block min-w-28 rounded-xl px-3 text-center align-middle leading-10 ${
              answered ? zoneDone : zoneIdle
            }`}
          >
            {answered ? q.correct : '\u00a0'}
          </DropZone>
          {after}
          {answered && <SpeakButton text={full} />}
        </div>
        {answered && q.tr && <p className="mt-2 text-white/70">{gloss(q)}</p>}
      </div>

      {answered ? (
        <button onClick={next} className={`mt-5 ${keyButton.primary}`}>
          {last ? t.games.finish : t.games.nextQuestion}
        </button>
      ) : (
        <div key={index} className="mt-5 flex flex-wrap gap-2.5">
          {q.options.map((option) =>
            tried.has(option) && wrong !== option ? (
              <span
                key={option}
                className="flex min-h-12 items-center rounded-2xl border-2 border-dashed border-white/10 px-4 py-2.5 text-lg font-bold text-white/25 line-through"
              >
                {option}
              </span>
            ) : (
              <DragChip
                key={option}
                tone={q.options.indexOf(option)}
                selected={selected === option}
                wrong={wrong === option}
                onTap={() => setSelected(selected === option ? null : option)}
                onDrop={() => place(option)}
              >
                {option}
              </DragChip>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default FillGame
