import { useState, type FormEvent } from 'react'
import SpeakButton from './SpeakButton'
import { activeLang } from '../config/lang'
import { language } from '../lib/language'

// The writing widget: two directions on the same api/correction.ts endpoint.
//   'correct'   — the learner writes in the target language, Felix returns the corrected
//                 sentence, what it means in Turkish, and every mistake explained.
//   'translate' — the learner writes in Turkish, Felix returns the target-language
//                 sentence and names the grammar it uses.
// They are tabs rather than two stacked forms because this whole widget also renders
// under every lesson, where two always-open textareas would bury the page.
//
// Each tab keeps its own draft and its own last answer, so switching to look something
// up and switching back does not throw away what the learner typed.
//
// Two callers, one component:
//   - pages/WritingCheck.tsx renders it bare, with a free-text topic field.
//   - LessonWriting renders it under a lesson and passes that lesson's title as `topic`,
//     which replaces the field: the answer is then explained in terms of the lesson
//     the learner is actually on, without them having to name it.
//
// The copy that names the taught language (placeholders, the translate tab) comes from
// the content pack (language.json → writingCheck), so each target ships only its own.
const COPY = language.writingCheck ?? {
  placeholder: '',
  translatePlaceholder: '',
  focusHint: '',
  translateTab: '',
  translateLead: '',
  pageLead: '',
}

type Mode = 'correct' | 'translate'

type Mistake = { original: string; fix: string; kind: string; explanation: string }
type Correction = { corrected: string; correctedTr?: string; errors: Mistake[]; tip: string }

type GrammarNote = { topic: string; note: string }
type Translation = { translation: string; grammar: GrammarNote[]; tip: string }

// Matches MAX_CHARS in api/correction.ts. The cap is the cost guard, so the textarea
// stops the learner before the request does.
const MAX_CHARS = 300

function WritingCheck({ topic }: { topic?: string }) {
  const [mode, setMode] = useState<Mode>('correct')
  const [drafts, setDrafts] = useState({ correct: '', translate: '' })
  const [focus, setFocus] = useState('')
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [translation, setTranslation] = useState<Translation | null>(null)
  const [errors, setErrors] = useState({ correct: '', translate: '' })
  const [loading, setLoading] = useState(false)

  const text = drafts[mode]
  const error = errors[mode]
  const setDraft = (value: string) =>
    setDrafts((prev) => ({ ...prev, [mode]: value.slice(0, MAX_CHARS) }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setErrors((prev) => ({ ...prev, [mode]: '' }))
    if (mode === 'correct') setCorrection(null)
    else setTranslation(null)

    try {
      const res = await fetch('/api/correction', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, focus: topic ?? focus, lang: activeLang, mode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [mode]: data.error ?? 'Bir şeyler ters gitti.' }))
      } else if (mode === 'correct') {
        setCorrection(data as Correction)
      } else {
        setTranslation(data as Translation)
      }
    } catch {
      setErrors((prev) => ({ ...prev, [mode]: 'Sunucuya ulaşılamadı.' }))
    } finally {
      setLoading(false)
    }
  }

  const clean = correction && correction.errors.length === 0

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        mode === value ? 'bg-white text-brand-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div>
      <div className="mb-3 inline-flex gap-1 rounded-lg bg-gray-100 p-1">
        {tab('correct', 'Cümlemi düzelt')}
        {tab('translate', COPY.translateTab)}
      </div>

      {mode === 'translate' && (
        <p className="mb-3 text-sm text-gray-600">{COPY.translateLead}</p>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div>
          <textarea
            value={text}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder={mode === 'translate' ? COPY.translatePlaceholder : COPY.placeholder}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {text.length}/{MAX_CHARS}
          </p>
        </div>

        {/* Under a lesson the topic is already known, so the field would only be a way to
            contradict it. */}
        {!topic && (
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder={COPY.focusHint}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? 'Bakıyor…' : mode === 'translate' ? 'Çevir' : 'Düzelt'}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {mode === 'correct' && correction && (
        <div className="mt-6 space-y-4">
          <div
            className={`rounded-lg border p-4 ${
              clean ? 'border-green-200 bg-green-50' : 'border-brand-200 bg-white'
            }`}
          >
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {clean ? 'Doğru yazmışsın' : 'Doğrusu'}
            </p>
            <p className="mt-1 text-lg font-medium">
              {correction.corrected}
              <SpeakButton text={correction.corrected} />
            </p>
            {/* The Turkish of the corrected sentence, not of what the learner wrote: it
                tells them whether the fix still says what they meant. Optional so a
                response from an older deployment does not render an empty line. */}
            {correction.correctedTr && (
              <p className="mt-1 text-sm text-gray-600">{correction.correctedTr}</p>
            )}
          </div>

          {correction.errors.map((mistake, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {mistake.kind}
              </span>
              <p className="mt-2">
                <span className="text-red-600 line-through">{mistake.original}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="font-medium text-green-700">{mistake.fix}</span>
              </p>
              <p className="mt-1.5 text-sm text-gray-600">{mistake.explanation}</p>
            </div>
          ))}

          <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
            💡 {correction.tip}
          </p>
        </div>
      )}

      {mode === 'translate' && translation && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-brand-200 bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Çevirisi
            </p>
            <p className="mt-1 text-lg font-medium">
              {translation.translation}
              <SpeakButton text={translation.translation} />
            </p>
          </div>

          {translation.grammar.map((note, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
              <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                {note.topic}
              </span>
              <p className="mt-2 text-sm text-gray-600">{note.note}</p>
            </div>
          ))}

          <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
            💡 {translation.tip}
          </p>
        </div>
      )}
    </div>
  )
}

export default WritingCheck
