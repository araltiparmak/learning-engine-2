import { useState } from 'react'
import { Link } from 'react-router'
import AudioPlayer from './AudioPlayer'
import ReadingQuestions from './ReadingQuestions'
import type { ListeningTest } from '../lib/listening'
import { activeLang } from '../config/lang'

// The body of a listening test — structures, player, transcript and questions — without a
// page header, so the listening page (/dinleme/:id) and a day of the daily plan both draw it.
function ListeningTestView({ test: t }: { test: ListeningTest }) {
  // Transcript and glossary sit right under the player so the learner can listen and read
  // along, but both start hidden: the first pass should be by ear, and the glossary alone
  // would hand over half the answers (seeing "Versichertenkarte" means not having to hear it).
  const [showTranscript, setShowTranscript] = useState(false)
  const [showEn, setShowEn] = useState(false)

  return (
    <>
      {/* Stands where a Turkish summary of the dialogue used to: a description gives away
          what the recording says, while the grammar behind it is what the learner should
          have in mind before pressing play — and it doubles as a way back to the lessons. */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Bu kayıtta geçen yapılar
        </p>
        <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {t.structures.map((s) => (
            <li key={s.label} className="text-sm">
              {s.to ? (
                <Link to={s.to} className="font-medium text-brand-700 hover:underline">
                  {s.label} →
                </Link>
              ) : (
                <span className="font-medium text-gray-700">{s.label}</span>
              )}
              <span className="block text-gray-500 italic">{s.pattern}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
        <span className="font-medium text-gray-600">Konuşanlar:</span>
        {t.speakers.map((s, i) => (
          <span key={s.name}>
            {s.name} <span className="text-gray-400">({s.role})</span>
            {i < t.speakers.length - 1 && <span className="ml-1 text-gray-300">·</span>}
          </span>
        ))}
      </p>

      {/* Sticky while the transcript is open, so a long dialogue can be read without
          scrolling back up to pause or rewind. */}
      <div
        className={
          showTranscript
            ? 'sticky top-14 z-30 -mx-4 mt-2 bg-gray-50/95 px-4 py-2 backdrop-blur'
            : 'mt-2'
        }
      >
        <AudioPlayer src={`/audio/${activeLang}/listening/${t.id}.mp3`} fallbackDuration={t.seconds} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTranscript((s) => !s)}
            aria-expanded={showTranscript}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-brand-400 hover:text-brand-700"
          >
            {showTranscript ? 'Metni gizle' : 'Metni göster'}
          </button>
          {showTranscript && (
            <button
              onClick={() => setShowEn((s) => !s)}
              aria-pressed={showEn}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-brand-400 hover:text-brand-700"
            >
              {showEn ? 'İngilizceyi gizle' : 'İngilizcesini göster'}
            </button>
          )}
          {!showTranscript && (
            <span className="text-sm text-gray-500">
              Önce yalnızca kulakla dene; takılırsan metni açıp dinlerken oku.
            </span>
          )}
        </div>
      </div>

      {showTranscript && (
        <>
          <article className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
            {t.transcript.map((turn, i) => (
              <div key={`${turn.speaker}-${i}`} className="mt-4 first:mt-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {turn.speaker}
                </p>
                <p className="leading-relaxed text-gray-800">{turn.de}</p>
                {showEn && turn.en && (
                  <p className="mt-0.5 text-sm text-gray-500 italic" lang="en">
                    {turn.en}
                  </p>
                )}
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
                    <span className="text-gray-600">— {g.tr}</span>
                    {g.note && <span className="text-xs text-gray-400">({g.note})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <ReadingQuestions key={t.id} questions={t.questions} medium="audio" />
    </>
  )
}

export default ListeningTestView
