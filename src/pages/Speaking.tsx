import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import { estimateMinutes } from '../lib/lessonTime'
import { speakingIntro, speakingLessons as lessons } from '../lib/speaking'
import { doneTopics, tracks } from '../lib/feed'
import { t } from '../i18n'

const feed = tracks.speaking

function Speaking() {
  const done = doneTopics()
  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">
            Konuşma <span className="align-middle text-2xl">🗣️</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">{speakingIntro}</p>
        </div>
      </div>

      {feed.topics.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">{t.feed.speakingTitle}</h2>
          <p className="mt-1 text-sm text-gray-600">{t.feed.speakingIntro}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {feed.topics.map((tp) => (
              <li key={tp.id}>
                <Link
                  to={`${feed.path}/${tp.id}`}
                  className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-sm"
                >
                  <div className="flex items-baseline gap-2">
                    {tp.emoji && <span className="text-xl">{tp.emoji}</span>}
                    <h3 className="font-semibold group-hover:text-brand-700">{tp.title}</h3>
                  </div>
                  {tp.description && (
                    <p className="mt-1 flex-1 text-sm text-gray-600">{tp.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
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

      <ul className="mt-8 space-y-4">
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              to={`/konusma/${l.id}`}
              className="group block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                {l.method}
              </p>
              <h2 className="mt-1 text-xl font-semibold group-hover:text-brand-700">
                <span className="mr-2">{l.emoji}</span>
                {l.title}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">{l.titleTr}</p>
              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Yöntem: </span>
                {l.methodNote}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-400">⏱ ~{estimateMinutes(l.doc)} dk</span>
                <span className="font-medium text-brand-600">Derse gir →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-gray-700">
        Her ders konuşmanın farklı bir kasını farklı bir yöntemle çalıştırıyor. 
        Sana en uygun gelen yöntemi bularak pratik yapmaya devam et.
      </p>
    </section>
  )
}

export default Speaking
