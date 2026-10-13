import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import Mascot from '../Mascot'
import { shuffle } from '../../lib/shuffle'
import { MAX_STARS, bestStars, saveStars, starsFor } from '../../lib/games'
import { t } from '../../i18n'

// Shared pieces of the word games. Every game is the same move — take a box, put it on
// a place, the game says whether it fits — so the drag lives here once.
//
// Dragging uses pointer events rather than the HTML5 drag API, which does nothing on a
// phone's touch screen. Each box can also be tapped: tap the box, then tap its place.
// That is the keyboard path too, since both are buttons.

let hovered: HTMLElement | null = null

/** The drop zone under a point, found by its `data-drop` attribute. */
function zoneAt(x: number, y: number): HTMLElement | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const zone = el.closest<HTMLElement>('[data-drop]')
    if (zone) return zone
  }
  return null
}

/** Marks the zone the dragged box is over, so it can light up (`data-over:` classes). */
function markHovered(zone: HTMLElement | null) {
  if (zone === hovered) return
  hovered?.removeAttribute('data-over')
  zone?.setAttribute('data-over', '')
  hovered = zone
}

// The games are played on a dark board (bg-brand-950, so it follows the colour theme);
// the boxes take a fixed bright palette that looks the same in every theme. Each tone is
// a 3D key: a darker bottom edge that flattens when pressed. Dark text on the light tones,
// white on the deep ones, so every pair stays readable at the boxes' large bold size.
const TONES = [
  'bg-[#E8505B] border-[#B8323D] text-white',
  'bg-[#FFC93C] border-[#D19B12] text-[#3D2C00]',
  'bg-[#2EC4B6] border-[#1C9187] text-[#03302B]',
  'bg-[#3B82F6] border-[#1D5FCC] text-white',
  'bg-[#8B5CF6] border-[#6435D6] text-white',
  'bg-[#FF9F43] border-[#D9771C] text-[#3D1F00]',
  'bg-[#DB4AA0] border-[#A82B77] text-white',
]
const CONFETTI = ['#E8505B', '#FFC93C', '#2EC4B6', '#3B82F6', '#8B5CF6', '#FF9F43', '#DB4AA0']

export const toneOf = (i: number) => TONES[((i % TONES.length) + TONES.length) % TONES.length]

/** An empty place on the board, and a place filled with the right box. */
export const zoneIdle = 'border-2 border-dashed border-white/30 bg-white/5 text-white'
export const zoneDone =
  'motion-safe:animate-pop border-b-4 border-emerald-700 bg-emerald-400 text-emerald-950'

/** The big pressable button style used under a round (next, finish, play again). */
export const keyButton = {
  primary:
    'rounded-2xl border-b-4 border-[#D19B12] bg-[#FFC93C] px-5 py-3 text-base font-black text-[#3D2C00] transition active:translate-y-0.5 active:border-b-2',
  quiet:
    'rounded-2xl border-b-4 border-white/20 bg-white/10 px-5 py-3 text-base font-bold text-white transition hover:bg-white/15 active:translate-y-0.5 active:border-b-2',
}

const chipBase =
  'min-h-12 rounded-2xl border-b-4 px-4 py-2.5 text-lg leading-tight font-bold select-none touch-none transition-[translate,scale,box-shadow]'

export function DragChip({
  tone,
  selected,
  wrong,
  onTap,
  onDrop,
  children,
}: {
  /** Index into the palette; give an item the same tone wherever it appears. */
  tone: number
  selected: boolean
  wrong: boolean
  onTap: () => void
  onDrop: (zoneId: string) => void
  children: ReactNode
}) {
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)
  // Where the drag started (pointer and page scroll) and where the pointer is now.
  const drag = useRef<{
    x: number
    y: number
    scroll: number
    px: number
    py: number
    moved: boolean
  } | null>(null)
  const frame = useRef(0)
  // The click the browser fires right after a drag's pointerup is not a tap. It arrives
  // in the same task, so a flag cleared by the next timer catches exactly that click.
  const justDragged = useRef(false)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // The box follows the pointer; the page scroll since the start is added because the
  // box's own place moves with the page while the pointer stays put.
  const follow = () => {
    const d = drag.current
    if (!d) return
    setOffset({ x: d.px - d.x, y: d.py - d.y + window.scrollY - d.scroll })
    markHovered(zoneAt(d.px, d.py))
  }

  // A drop zone can sit below the fold on a phone: holding the box near the top or
  // bottom edge scrolls the page, for as long as it is held there.
  const edgeScroll = () => {
    const d = drag.current
    if (!d) return
    const edge = 70
    const step = d.py > window.innerHeight - edge ? 10 : d.py < edge ? -10 : 0
    if (step) {
      window.scrollBy(0, step)
      follow()
    }
    frame.current = requestAnimationFrame(edgeScroll)
  }

  const end = () => {
    drag.current = null
    cancelAnimationFrame(frame.current)
    setOffset(null)
    markHovered(null)
  }

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        if (e.button !== 0) return
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          scroll: window.scrollY,
          px: e.clientX,
          py: e.clientY,
          moved: false,
        }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d) return
        d.px = e.clientX
        d.py = e.clientY
        if (!d.moved) {
          if (Math.hypot(d.px - d.x, d.py - d.y) < 6) return
          d.moved = true
          frame.current = requestAnimationFrame(edgeScroll)
        }
        follow()
      }}
      onPointerUp={(e) => {
        const moved = drag.current?.moved
        end()
        if (!moved) return
        justDragged.current = true
        setTimeout(() => (justDragged.current = false))
        const zone = zoneAt(e.clientX, e.clientY)
        if (zone?.dataset.drop) onDrop(zone.dataset.drop)
      }}
      onPointerCancel={end}
      onClick={() => {
        if (justDragged.current) return
        onTap()
      }}
      aria-pressed={selected}
      style={offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
      className={`${chipBase} ${toneOf(tone)} ${
        offset
          ? 'relative z-50 scale-110 rotate-2 cursor-grabbing shadow-2xl'
          : wrong
            ? 'animate-shake ring-4 ring-red-400'
            : selected
              ? '-translate-y-1 cursor-grab shadow-lg ring-4 ring-white'
              : 'cursor-grab hover:-translate-y-0.5 active:translate-y-0.5'
      }`}
    >
      {children}
    </button>
  )
}

/** A place a box can be dropped on. Only an `active` zone takes drops and taps. */
export function DropZone({
  id,
  active,
  onTap,
  label,
  className,
  children,
}: {
  id: string
  active: boolean
  onTap: () => void
  /** For a zone whose content does not say what it is (an empty gap). */
  label?: string
  className: string
  children: ReactNode
}) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onTap()
  }
  return (
    <div
      data-drop={active ? id : undefined}
      role={active ? 'button' : undefined}
      tabIndex={active ? 0 : undefined}
      aria-label={active ? label : undefined}
      onClick={active ? onTap : undefined}
      onKeyDown={active ? onKeyDown : undefined}
      className={`${className} ${active ? 'cursor-pointer transition-colors data-over:bg-white/15 data-over:ring-4 data-over:ring-[#FFC93C]' : ''}`}
    >
      {children}
    </div>
  )
}

const POINTS = 10

/** Right answers in a row raise the points per answer: ×2 from 3 in a row, ×3 from 5. */
const multiplier = (combo: number) => (combo >= 5 ? 3 : combo >= 3 ? 2 : 1)

/** Score, combo, mistakes and time for one round; `finish` freezes the clock. */
export function useGameRun() {
  const [mistakes, setMistakes] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  // The points of the last right answer, keyed so the "+20" floats again each time.
  const [gain, setGain] = useState<{ points: number; id: number } | null>(null)
  const [startedAt] = useState(() => Date.now())
  const [seconds, setSeconds] = useState<number | null>(null)
  return {
    mistakes,
    score,
    combo,
    gain,
    seconds,
    hit: () => {
      const points = POINTS * multiplier(combo + 1)
      setCombo(combo + 1)
      setScore((s) => s + points)
      setGain({ points, id: Date.now() })
    },
    miss: () => {
      setMistakes((n) => n + 1)
      setCombo(0)
    },
    finish: () => setSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000))),
  }
}

export type GameRun = ReturnType<typeof useGameRun>

/** The box (and zone) that was just dropped wrong, for a short shake. */
export function useWrongFlash() {
  const [wrong, setWrong] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const flash = (key: string) => {
    window.clearTimeout(timer.current)
    setWrong(key)
    timer.current = window.setTimeout(() => setWrong(null), 450)
  }
  return [wrong, flash] as const
}

/** Above the board: how far the round is, the score and a running combo. */
export function GameHud({ run, done, total }: { run: GameRun; done: number; total: number }) {
  const mult = multiplier(run.combo)
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-[#FFC93C] transition-[width] duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        {mult > 1 && (
          <span
            key={mult}
            className="shrink-0 rounded-full bg-[#FF9F43] px-2.5 py-1 text-xs font-black text-[#3D1F00] motion-safe:animate-pop"
          >
            🔥 {t.games.combo(mult)}
          </span>
        )}
        <span className="relative shrink-0 text-right text-2xl font-black text-white tabular-nums">
          <span className="sr-only">{t.games.score}: </span>
          {run.score}
          {run.gain && (
            <span
              key={run.gain.id}
              aria-hidden
              className="pointer-events-none absolute -top-5 right-0 text-sm font-black text-[#FFC93C] animate-gain motion-reduce:hidden"
            >
              +{run.gain.points}
            </span>
          )}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-white/50 tabular-nums">
        {t.games.progress(done, total)}
        {run.mistakes > 0 && <span className="text-red-300"> · {t.games.mistakes(run.mistakes)}</span>}
      </p>
    </div>
  )
}

export type GameNav = {
  onAgain: () => void
  onNext?: () => void
  /** Where the best star count is kept: "<set>/<game>". */
  scoreKey: string
  /** Called once the round's stars are stored, so star counts around the game refresh. */
  onStars?: () => void
}

function Star({ on, delay }: { on: boolean; delay: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-14 w-14 motion-safe:animate-star"
      style={{ animationDelay: `${delay}ms` }}
    >
      <path
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
        fill={on ? '#FFC93C' : 'rgb(255 255 255 / 0.12)'}
        stroke={on ? '#D19B12' : 'none'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 36 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      size: 6 + Math.random() * 6,
      color: CONFETTI[i % CONFETTI.length],
      round: i % 3 === 0,
    })),
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            borderRadius: p.round ? '50%' : 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/** End of a round: stars for the mistakes, the score, and the way on. */
export function GameDone({ run, scoreKey, onAgain, onNext, onStars }: GameNav & { run: GameRun }) {
  const stars = starsFor(run.mistakes)
  const [before] = useState(() => bestStars(scoreKey))
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    saveStars(scoreKey, stars)
    onStars?.()
    // The board shrinks to this panel; bring it into view wherever the last drop was.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    box.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    // Runs once per finished round; onStars is a fresh closure on every render.
  }, [])

  return (
    <div ref={box} className="relative overflow-hidden rounded-2xl bg-white/5 px-5 py-8 text-center text-white">
      <Confetti />
      <Mascot mood="celebrate" className="mx-auto w-16" />
      <p className="mt-2 text-2xl font-black">{t.games.done}</p>
      <div role="img" aria-label={t.games.starsLabel(stars)} className="mt-3 flex justify-center gap-1">
        {Array.from({ length: MAX_STARS }, (_, i) => (
          <Star key={i} on={i < stars} delay={250 + i * 220} />
        ))}
      </div>
      <p className="mt-3 text-5xl font-black tabular-nums">{run.score}</p>
      <p className="text-sm text-white/60">{t.games.score}</p>
      {before > 0 && stars > before && (
        <p className="mt-3 inline-block rounded-full bg-[#FFC93C] px-3 py-1 text-sm font-black text-[#3D2C00]">
          {t.games.newBest}
        </p>
      )}
      <p className="mt-3 text-white/80">
        {t.games.result(run.seconds ?? 0, run.mistakes)}
        {run.mistakes === 0 && <span className="block font-bold text-[#FFC93C]">{t.games.perfect}</span>}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onNext && (
          <button onClick={onNext} className={keyButton.primary}>
            {t.games.next}
          </button>
        )}
        <button onClick={onAgain} className={onNext ? keyButton.quiet : keyButton.primary}>
          {t.games.again}
        </button>
      </div>
      <p className="mt-5 text-xs text-white/50">{t.games.starRule}</p>
    </div>
  )
}

/** `count` items picked at random, in their original order; all of them without a count. */
export function sample<T>(items: T[], count?: number): T[] {
  if (!count || count >= items.length) return items
  const chosen = new Set(shuffle(items).slice(0, count))
  return items.filter((item) => chosen.has(item))
}
