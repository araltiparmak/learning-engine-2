import { useState, type FormEvent } from 'react'
import { activeLang } from '../config/lang'
import { language } from '../lib/language'
import {
  getWords,
  removeWord,
  saveWord,
  type SavedWord,
  type WordCard,
} from '../lib/wordCards'

// "Words I want to learn": the learner types a word, Felix (api/correction.ts, mode
// 'word') answers with a study card — meaning, forms, examples, opposites — and the card
// is kept in localStorage so the list grows into a personal glossary.
//
// One component for both places it appears (the notes widget on lesson/quiz pages and the
// notes page), so the layout is written narrow-first: it has to survive the 288px inside
// the widget panel.
//
// Deliberately no SpeakButton: clips are pre-generated per text, and a word the learner
// just invented a lookup for has none — the button would be missing anyway and every card
// would log a console warning.

// Matches MAX_WORD_CHARS in api/correction.ts.
const MAX_CHARS = 60

// The copy that names the taught language comes from the content pack
// (language.json → wordLookup), so each target ships only its own.
const COPY = language.wordLookup ?? { placeholder: '', lead: '' }

// The card body, shared by the freshly looked-up word and every saved one.
function WordCardView({ card }: { card: WordCard }) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-gray-800">{card.meaningTr}</p>
        {card.meaningEn && <p className="mt-0.5 text-xs text-gray-500">EN: {card.meaningEn}</p>}
      </div>

      {card.forms.length > 0 && (
        <dl className="space-y-1 rounded-lg bg-gray-50 p-3">
          {card.forms.map((form, index) => (
            <div key={index} className="flex flex-wrap gap-x-2">
              <dt className="shrink-0 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {form.label}
              </dt>
              <dd className="font-medium text-gray-800">{form.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {card.examples.map((example, index) => (
        <div key={index} className="border-l-2 border-brand-300 pl-3">
          <p className="font-medium text-gray-800">{example.sentence}</p>
          <p className="text-xs text-gray-500">{example.tr}</p>
        </div>
      ))}

      {card.opposites.length > 0 && (
        <p className="text-gray-700">
          <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Zıttı:{' '}
          </span>
          {card.opposites.map((opposite, index) => (
            <span key={index}>
              {index > 0 && ', '}
              <span className="font-medium">{opposite.word}</span>{' '}
              <span className="text-gray-500">({opposite.tr})</span>
            </span>
          ))}
        </p>
      )}

      {card.tip && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-gray-700">💡 {card.tip}</p>
      )}
    </div>
  )
}

function WordLookup() {
  const [query, setQuery] = useState('')
  const [words, setWords] = useState<SavedWord[]>(getWords)
  // The headword of the open card — only one is expanded at a time, which is what keeps
  // a long list usable inside the narrow widget panel.
  const [open, setOpen] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const text = query.trim()
    if (!text || loading) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/correction', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, lang: activeLang, mode: 'word' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Bir şeyler ters gitti.')
      } else {
        const card = data as WordCard
        setWords(saveWord(card, text))
        setOpen(card.headword)
        setQuery('')
      }
    } catch {
      setError('Sunucuya ulaşılamadı.')
    } finally {
      setLoading(false)
    }
  }

  const drop = (headword: string) => {
    setWords(removeWord(headword))
    if (open === headword) setOpen('')
  }

  return (
    <div>
      <p className="text-xs text-gray-500">{COPY.lead}</p>

      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARS))}
          placeholder={COPY.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? '…' : 'Hazırla'}
        </button>
      </form>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      {words.length === 0 ? (
        <p className="mt-4 text-xs text-gray-400">
          Henüz kelime eklemedin. Eklediğin kelimeler burada birikir.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {words.map((word) => {
            const expanded = open === word.headword
            return (
              <li
                key={word.headword}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => setOpen(expanded ? '' : word.headword)}
                    aria-expanded={expanded}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="font-semibold text-gray-800">{word.headword}</span>
                    {word.kind && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                        {word.kind}
                      </span>
                    )}
                    {!expanded && (
                      <span className="block truncate text-xs text-gray-500">
                        {word.meaningTr}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => drop(word.headword)}
                    title="Kelimeyi kaldır"
                    aria-label={`${word.headword} kelimesini kaldır`}
                    className="shrink-0 rounded px-1 text-lg leading-none text-gray-300 transition hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
                {expanded && (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <WordCardView card={word} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default WordLookup
