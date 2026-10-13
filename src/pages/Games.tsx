import { Link } from 'react-router'
import { MAX_STARS, gameSets, setStars } from '../lib/games'
import { toneOf } from '../components/games/common'
import { t } from '../i18n'

// The "Kelime oyunları" tab of the Oyunlar page (Play): one big card per word group, in the games'
// bright palette, with the stars won so far.
function Games() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {gameSets.map((set, i) => {
        const stars = setStars(set)
        const total = set.games.length * MAX_STARS
        return (
          <li key={set.id}>
            <Link
              to={`/oyunlar/${set.id}`}
              className={`flex h-full flex-col gap-3 rounded-3xl border-b-[6px] p-5 transition hover:-translate-y-1 active:translate-y-0 ${toneOf(i)}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-2xl font-black">{set.title}</span>
                  <span className="block font-semibold opacity-80">{set.de}</span>
                </span>
                {set.emoji && <span className="text-5xl leading-none">{set.emoji}</span>}
              </span>
              <span className="mt-auto flex items-center justify-between gap-3 text-sm font-bold">
                <span>
                  {set.level} · {t.games.gameCount(set.games.length)}
                </span>
                <span className="rounded-full bg-black/15 px-2.5 py-1">
                  ★ {stars} / {total}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default Games
