import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import {
  MAX_STARS,
  bestStars,
  gameKey,
  gameSets,
  setStars,
  type Game,
  type GameItem,
} from '../lib/games'
import { t } from '../i18n'
import MatchGame from '../components/games/MatchGame'
import OrderGame from '../components/games/OrderGame'
import SortGame from '../components/games/SortGame'
import FillGame from '../components/games/FillGame'
import type { GameNav } from '../components/games/common'

// What each kind of game looks like on its picker tile.
const TYPE_EMOJI: Record<Game['type'], string> = { match: '🔗', order: '🔢', sort: '🧺', fill: '✏️' }

function StarRow({ n }: { n: number }) {
  return (
    <span aria-label={t.games.starsLabel(n)} className="text-sm tracking-tight">
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <span key={i} className={i < n ? 'text-[#F5B400]' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

function GameView({ game, items, nav }: { game: Game; items: GameItem[]; nav: GameNav }) {
  switch (game.type) {
    case 'match':
      return <MatchGame game={game} items={items} {...nav} />
    case 'order':
      return <OrderGame game={game} items={items} {...nav} />
    case 'sort':
      return <SortGame game={game} items={items} {...nav} />
    case 'fill':
      return <FillGame game={game} {...nav} />
  }
}

// One word group and its games. The open game sits in the URL (?oyun=…) so a link or a
// reload lands on the same game.
function GameSetPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  // Bumped by "play again": a new key remounts the game with a fresh shuffle.
  const [round, setRound] = useState(0)
  // Bumped when a round stores its stars, so the tiles and the set total re-read them.
  const [, setStarsSeen] = useState(0)
  const set = gameSets.find((s) => s.id === id)

  if (!set) {
    return (
      <section>
        <p className="text-gray-600">{t.games.notFound}</p>
        <Link to="/oyunlar" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
          {t.games.back}
        </Link>
      </section>
    )
  }

  const index = Math.max(
    0,
    set.games.findIndex((g) => g.id === params.get('oyun')),
  )
  const game = set.games[index]
  const nextGame = set.games[index + 1]
  const open = (gameId: string) => {
    setParams({ oyun: gameId }, { replace: true })
    setRound((r) => r + 1)
  }

  return (
    <section className="max-w-3xl">
      <Link to="/oyunlar" className="text-sm text-brand-600 hover:underline">
        {t.games.back}
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {set.emoji} {set.title}
        </h1>
        <p className="pb-1 text-sm font-semibold text-gray-600">
          <span className="text-[#F5B400]">★</span>{' '}
          {t.games.stars(setStars(set), set.games.length * MAX_STARS)}
        </p>
      </div>
      {set.intro && <p className="mt-2 max-w-2xl text-gray-600">{set.intro}</p>}

      {/* A swipeable strip on a phone, one row of tiles from sm up. */}
      <div className="-mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {set.games.map((g) => {
          const current = g.id === game.id
          return (
            <button
              key={g.id}
              onClick={() => open(g.id)}
              aria-pressed={current}
              className={`flex w-36 shrink-0 flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition sm:w-auto ${
                current
                  ? 'border-brand-950 bg-brand-950 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:-translate-y-0.5 hover:border-brand-400'
              }`}
            >
              <span className="text-2xl leading-none">{TYPE_EMOJI[g.type]}</span>
              <span className="text-sm leading-snug font-bold">{g.title}</span>
              <StarRow n={bestStars(gameKey(set.id, g.id))} />
            </button>
          )
        })}
      </div>

      <div className="mt-5 rounded-3xl bg-brand-950 p-4 text-white shadow-xl sm:p-6">
        <h2 className="text-2xl font-black">
          {TYPE_EMOJI[game.type]} {game.title}
        </h2>
        {game.intro && <p className="mt-1 text-white/70">{game.intro}</p>}
        <div className="mt-5">
          <GameView
            key={`${game.id}-${round}`}
            game={game}
            items={set.items}
            nav={{
              onAgain: () => setRound((r) => r + 1),
              onNext: nextGame && (() => open(nextGame.id)),
              scoreKey: gameKey(set.id, game.id),
              onStars: () => setStarsSeen((n) => n + 1),
            }}
          />
        </div>
        <p className="mt-5 text-xs text-white/40">{t.games.howTo}</p>
      </div>
    </section>
  )
}

export default GameSetPage
