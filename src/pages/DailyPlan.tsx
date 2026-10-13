import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import config from '../config'
import { dayNumber, days, doneDays, levels, planIntro } from '../lib/dailyPlan'
import { t } from '../i18n'

// Each card names the day's pattern lesson by its title from the lesson list, so the
// title is written once, in list.json.
const lessonTitles = new Map(
  config.lessonsList.flatMap((s) => s.lessons.map((l) => [l.slug, l.title] as const)),
)

function DailyPlan() {
  const done = doneDays()
  // The first unfinished day is the one to open today.
  const nextId = days.find((d) => !done.has(d.id))?.id

  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">{t.daily.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">{planIntro}</p>
        </div>
      </div>

      {levels.map((level) => (
        <div key={level} className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500">{level}</h2>
          <ol className="mt-3 grid gap-4 sm:grid-cols-2">
            {days
              .filter((d) => d.level === level)
              .map((d) => (
                <li key={d.id}>
                  <Link
                    to={`/gunluk/${d.id}`}
                    className={`group flex h-full flex-col rounded-xl border bg-white p-5 transition hover:border-brand-400 hover:shadow-md ${
                      d.id === nextId ? 'border-brand-400' : 'border-gray-200'
                    }`}
                  >
                    <p className="flex items-center justify-between gap-2 text-xs font-semibold text-brand-700">
                      <span>
                        {t.daily.dayLabel(dayNumber(d))} · {d.emoji && `${d.emoji} `}
                        {d.theme}
                      </span>
                      {done.has(d.id) ? (
                        <span className="text-green-700">{t.daily.done}</span>
                      ) : (
                        d.id === nextId && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5">{t.daily.next}</span>
                        )
                      )}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold group-hover:text-brand-700">{d.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-gray-600">
                      {lessonTitles.get(d.lesson) ?? d.lesson}
                    </p>
                  </Link>
                </li>
              ))}
          </ol>
        </div>
      ))}
    </section>
  )
}

export default DailyPlan
