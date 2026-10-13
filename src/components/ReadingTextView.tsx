import { useState } from 'react'
import { Link } from 'react-router'
import SpeakButton from './SpeakButton'
import ReadingQuestions from './ReadingQuestions'
import type { ReadingText } from '../lib/reading'

// The body of a reading text — intro, the text itself, glossary and questions — without a
// page header, so the reading page (/okuma/:id) and a day of the daily plan both draw it.
function ReadingTextView({ text: t }: { text: ReadingText }) {
  // The translation starts hidden: try to understand the German first, then check.
  const [showTr, setShowTr] = useState(false)
  const fullText = t.text.map((p) => p.de).join(' ')

  return (
    <>
      <p className="mt-3 text-gray-700">{t.intro}</p>

      {t.grammatik && t.grammatik.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">Bu metindeki yapılar:</span>
          {t.grammatik.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className="rounded-full border border-brand-300 px-2.5 py-0.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
            >
              {g.label} →
            </Link>
          ))}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <SpeakButton text={fullText} />
        <button
          onClick={() => setShowTr((s) => !s)}
          aria-pressed={showTr}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          {showTr ? 'Türkçeyi gizle' : 'Türkçesini göster'}
        </button>
      </div>

      <article className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
        {t.text.map((p) => (
          <div key={p.de} className="mt-4 first:mt-0">
            <p className="leading-relaxed text-gray-800">
              {p.de}
              <SpeakButton text={p.de} />
            </p>
            {showTr && <p className="mt-1 text-sm text-gray-500">{p.tr}</p>}
          </div>
        ))}
      </article>

      {t.glossar.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            📖 Kelime yardımı
          </p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {t.glossar.map((g) => (
              <li key={g.de} className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-medium text-brand-700">{g.de}</span>
                <SpeakButton text={g.de} />
                <span className="text-gray-600">— {g.tr}</span>
                {g.note && <span className="text-xs text-gray-400">({g.note})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReadingQuestions key={t.id} questions={t.questions} />
    </>
  )
}

export default ReadingTextView
