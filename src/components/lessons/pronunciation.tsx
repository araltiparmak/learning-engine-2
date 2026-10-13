import { useEffect, useRef, useState } from 'react'
import SpeakButton from '../SpeakButton'
import { targetLocale } from '../../config/lang'
import { sourceRows } from '../../data/sources'
import { useRowFavorites } from '../rowFavorites'

// Mic drill: the learner reads a line out loud, the browser's speech recognition turns it
// into text, and that text is compared word by word with the target. Unlike SpeakButton
// (playback only, pre-generated clips) this needs no audio file — the recogniser runs in
// the browser. Firefox has no SpeechRecognition, so the block degrades to a plain list.
//
// The score is a guide, not a verdict: the recogniser matches WORDS, so it catches a sound
// that turns one word into another ("think" heard as "sink") and stays blind to a merely
// heavy accent. That is why the heard text is always printed next to the score — it is the
// part that actually tells the learner where the sound slipped.

type Row = { en: string; tr: string; note?: string }
type Attempt = { score: number; heard: string; marks: boolean[] }

type Alternative = { transcript: string }
type ResultEvent = { results: ArrayLike<ArrayLike<Alternative>> }
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  abort: () => void
  onresult: ((event: ResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

function recognitionClass(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition
    webkitSpeechRecognition?: new () => Recognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Mikrofon izni verilmedi. Adres çubuğundaki kilit simgesinden izin ver.',
  'service-not-allowed': 'Tarayıcı tanıma servisini engelledi.',
  'no-speech': 'Ses algılanmadı. Mikrofona biraz daha yakın konuş.',
  'audio-capture': 'Mikrofon bulunamadı.',
  network: 'Tanıma servisine ulaşılamadı (internet bağlantısı gerekiyor).',
  aborted: '',
}

// Punctuation and capitals are not pronunciation, and "don't" may come back as "dont",
// so both sides are flattened to bare lowercase words before they are compared.
const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

// Word-level Levenshtein. The backtrace marks which TARGET words survived, so a missing
// or swapped word can be highlighted in place; the score also counts words the learner
// added, hence max(n, m) in the denominator.
function compare(target: string[], heard: string[]) {
  const n = target.length
  const m = heard.length
  const d: number[][] = []
  for (let i = 0; i <= n; i++) {
    d[i] = []
    for (let j = 0; j <= m; j++) d[i][j] = i === 0 ? j : j === 0 ? i : 0
  }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const swap = d[i - 1][j - 1] + (target[i - 1] === heard[j - 1] ? 0 : 1)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, swap)
    }
  }
  const marks: boolean[] = new Array(n).fill(false)
  let i = n
  let j = m
  while (i > 0) {
    const same = j > 0 && target[i - 1] === heard[j - 1]
    if (j > 0 && d[i][j] === d[i - 1][j - 1] + (same ? 0 : 1)) {
      marks[i - 1] = same
      i--
      j--
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      j--
    } else {
      i--
    }
  }
  return { marks, score: Math.round(100 * (1 - d[n][m] / Math.max(n, m, 1))) }
}

const tone = (score: number) =>
  score >= 85
    ? 'border-green-300 bg-green-50 text-green-800'
    : score >= 60
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-rose-300 bg-rose-50 text-rose-800'

const verdict = (score: number) =>
  score >= 85 ? 'Temiz 🎯' : score >= 60 ? 'Yaklaştın' : 'Tekrar dene'

export function PronunciationCheck({
  source,
  group,
  note,
}: {
  source: string
  group: string
  note?: string
}) {
  const fav = useRowFavorites()
  const rows = sourceRows<Row>(source, group).filter((row) => fav.shows(row.en))
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({})
  const [listening, setListening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognition = useRef<Recognition | null>(null)
  const Recognizer = recognitionClass()

  // A recording left running after the page changes would keep the mic indicator on.
  useEffect(() => () => recognition.current?.abort(), [])

  function listen(row: Row) {
    if (!Recognizer) return
    recognition.current?.abort()
    setError(null)
    const rec = new Recognizer()
    rec.lang = targetLocale
    rec.continuous = false
    rec.interimResults = false
    // Only the recogniser's best guess counts: picking the closest of several
    // alternatives would quietly "fix" exactly the sound the drill is testing.
    rec.maxAlternatives = 1
    rec.onresult = (event) => {
      const heard = event.results[0][0].transcript
      setAttempts((prev) => ({
        ...prev,
        [row.en]: { heard, ...compare(words(row.en), words(heard)) },
      }))
    }
    rec.onerror = (event) => setError(ERRORS[event.error] ?? `Tanıma hatası: ${event.error}`)
    rec.onend = () => setListening(null)
    recognition.current = rec
    setListening(row.en)
    rec.start()
  }

  const scores = rows.map((row) => attempts[row.en]).filter(Boolean)
  const average = scores.length
    ? Math.round(scores.reduce((sum, a) => sum + a.score, 0) / scores.length)
    : 0

  return (
    <div className="mt-3">
      {!Recognizer && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          🎤 Bu tarayıcı mikrofonla telaffuz kontrolünü desteklemiyor. Chrome, Edge veya
          Safari'de aç; satırları yine de dinleyebilirsin.
        </p>
      )}
      {error && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((row) => {
          const attempt = attempts[row.en]
          const active = listening === row.en
          return (
            <li key={row.en} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              {fav.save(row.en)}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="italic text-gray-800">
                    {row.en}
                    <SpeakButton text={row.en} />
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{row.tr}</p>
                  {row.note && <p className="mt-1.5 text-sm text-brand-800">💡 {row.note}</p>}
                </div>
                {Recognizer && (
                  <button
                    onClick={() => listen(row)}
                    disabled={active}
                    aria-label={`Oku ve puanla: ${row.en}`}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? 'animate-pulse bg-rose-100 text-rose-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {active ? '● Dinliyorum' : '🎤 Oku'}
                  </button>
                )}
              </div>

              {attempt && (
                <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${tone(attempt.score)}`}>
                  <p className="font-semibold">
                    {attempt.score} puan — {verdict(attempt.score)}
                  </p>
                  <p className="mt-1.5 flex flex-wrap gap-1">
                    {words(row.en).map((word, index) => (
                      <span
                        key={`${word}-${index}`}
                        className={`rounded px-1.5 py-0.5 ${
                          attempt.marks[index]
                            ? 'bg-green-100 text-green-900'
                            : 'bg-rose-100 text-rose-900 line-through decoration-rose-400'
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                  <p className="mt-1.5 text-gray-600">
                    Duyulan: <span className="italic">“{attempt.heard}”</span>
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {scores.length > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold">{average} puan</span> ortalama ·{' '}
            {scores.length}/{rows.length} satır okundu
          </p>
          <button
            onClick={() => setAttempts({})}
            className="shrink-0 rounded-full bg-white px-3 py-1 text-gray-600 ring-1 ring-gray-300 transition hover:bg-gray-100"
          >
            Sıfırla
          </button>
        </div>
      )}

      {note && <p className="mt-2 text-sm text-gray-500">{note}</p>}
    </div>
  )
}
