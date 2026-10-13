import SpeakButton from '../SpeakButton'

type GrammarNote = { label: string; text: string }
type VocabNote = { word: string; meaning: string }
type Turn = { who: string; de: string; tr: string; grammar?: GrammarNote; vocab?: VocabNote[] }

// A grammar/vocab lesson taught through a back-and-forth dialogue instead of rule-first
// prose. Each turn can carry an optional grammar note (which rule just fired) and/or vocab
// notes (new words used) — the conversation reads on its own, the notes add depth on top.
// Layout follows SpeechDialog's alternating bubbles, but this lives apart from speech.tsx:
// that file drills a phrase for speaking, this one teaches a rule.
export default function DialogLesson({ turns }: { turns: Turn[] }) {
  const speakers = [...new Set(turns.map((t) => t.who))]
  return (
    <div className="mt-4 space-y-3">
      {turns.map((t, i) => {
        const left = t.who === speakers[0]
        return (
          <div key={i} className={left ? '' : 'sm:pl-10'}>
            <div
              className={`rounded-xl border px-4 py-3 ${
                left ? 'border-gray-200 bg-white' : 'border-brand-200 bg-brand-50/60'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.who}</p>
              <p className="mt-1 text-gray-900">
                {t.de}
                <SpeakButton text={t.de} />
              </p>
              <p className="mt-0.5 text-sm text-gray-500">{t.tr}</p>
              {t.grammar && (
                <p className="mt-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-800">
                  <span className="mr-1.5 rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-900">
                    {t.grammar.label}
                  </span>
                  {t.grammar.text}
                </p>
              )}
              {t.vocab && t.vocab.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {t.vocab.map((v) => (
                    <span
                      key={v.word}
                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                    >
                      {v.word} <span className="text-emerald-600">— {v.meaning}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
