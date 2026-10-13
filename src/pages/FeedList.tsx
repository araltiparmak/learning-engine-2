import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import { doneTopics, feedIntro, topics, tracks } from '../lib/feed'
import { t } from '../i18n'

// Topic picker for the feed. Topics are grouped by the level they carry, so B1 topics
// get their own group just by being added to feed.json.
const levels = [...new Set(topics.map((tp) => tp.level))]

// Speaking feeds live in the speaking tab, but are listed here too so the feed shows both.
const speaking = tracks.speaking

function FeedList() {
  const done = doneTopics()

  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">{t.feed.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{feedIntro}</p>
        </div>
      </div>

      {levels.map((level) => (
        <div key={level} className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500">{level}</h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {topics
              .filter((tp) => tp.level === level)
              .map((tp) => (
                <li key={tp.id}>
                  <Link
                    to={`/akis/${tp.id}`}
                    className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md"
                  >
                    <div className="flex items-baseline gap-2">
                      {tp.emoji && <span className="text-2xl">{tp.emoji}</span>}
                      <h3 className="text-lg font-semibold group-hover:text-brand-700">
                        {tp.title}
                      </h3>
                    </div>
                    {tp.description && (
                      <p className="mt-1 flex-1 text-sm text-gray-600">{tp.description}</p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      {t.feed.cardCount(tp.cards.length)}
                      {done.has(tp.id) && (
                        <span className="ml-2 font-medium text-green-700">{t.feed.done}</span>
                      )}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {speaking.topics.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500">
            {t.feed.speakingTitle}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{t.feed.speakingIntro}</p>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {speaking.topics.map((tp) => (
              <li key={tp.id}>
                <Link
                  to={`${speaking.path}/${tp.id}`}
                  className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md"
                >
                  <div className="flex items-baseline gap-2">
                    {tp.emoji && <span className="text-2xl">{tp.emoji}</span>}
                    <h3 className="text-lg font-semibold group-hover:text-brand-700">
                      {tp.title}
                    </h3>
                  </div>
                  {tp.description && (
                    <p className="mt-1 flex-1 text-sm text-gray-600">{tp.description}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    {tp.level} · {t.feed.cardCount(tp.cards.length)}
                    {done.has(tp.id) && (
                      <span className="ml-2 font-medium text-green-700">{t.feed.done}</span>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default FeedList
