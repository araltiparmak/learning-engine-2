import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import { readingIntro, readingTexts as texts, type ReadingText } from '../lib/reading'


const wordCount = (t: ReadingText) =>
  t.text.reduce((sum, p) => sum + p.de.trim().split(/\s+/).length, 0)

function Reading() {
  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">
            Okuma <span className="align-middle text-2xl">📖</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">{readingIntro}</p>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {texts.map((t) => (
          <li key={t.id}>
            <Link
              to={`/okuma/${t.id}`}
              className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-2xl">{t.emoji}</span>
                <h2 className="text-lg font-semibold group-hover:text-brand-700">{t.title}</h2>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{t.titleTr}</p>
              <p className="mt-2 flex-1 text-sm text-gray-600">{t.intro}</p>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
                  {t.thema}
                </span>
                {t.level && <span className="font-medium text-gray-600">{t.level}</span>}
                <span>{wordCount(t)} kelime</span>
                <span>·</span>
                <span>{t.questions.length} soru</span>
              </p>
              <span className="mt-3 text-sm font-medium text-brand-600">Metni oku →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Reading
