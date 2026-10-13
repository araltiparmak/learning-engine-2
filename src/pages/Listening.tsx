import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import { listeningIntro, listeningTests as tests } from '../lib/listening'


// Most listening tests run under a minute, where "0:56 dk" reads worse than "56 sn".
const formatLength = (seconds: number) =>
  seconds < 60
    ? `${seconds} sn`
    : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} dk`

function Listening() {
  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">
            Dinleme <span className="align-middle text-2xl">🎧</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">{listeningIntro}</p>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {tests.map((t) => (
          <li key={t.id}>
            <Link
              to={`/dinleme/${t.id}`}
              className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-2xl">{t.emoji}</span>
                <h2 className="text-lg font-semibold group-hover:text-brand-700">{t.title}</h2>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{t.titleTr}</p>
              {/* The grammar carried by the recording, not a summary of it: it says what
                  the test practises without spoiling what happens in the dialogue. */}
              <ul className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                {t.structures.map((s) => (
                  <li
                    key={s.label}
                    className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
                  {t.thema}
                </span>
                <span>{t.level}</span>
                <span>·</span>
                <span>{formatLength(t.seconds)}</span>
                <span>·</span>
                <span>{t.questions.length} soru</span>
              </p>
              <span className="mt-3 text-sm font-medium text-brand-600">Kaydı dinle →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Listening
