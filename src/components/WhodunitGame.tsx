import { useState } from 'react'
import Mascot from './Mascot'
import SpeakButton from './SpeakButton'

export type Suspect = {
  name: string
  role: string
  de: string
  tr: string
  guilty?: boolean
  reason: string
}
export type GlossEntry = { de: string; tr: string; note?: string }
export type Whodunit = {
  intro: string
  facts: string[]
  prompt: string
  suspects: Suspect[]
  solved: string
  /** Optional vocabulary help: the statements' Turkish is hidden, so hard words go here. */
  glossar?: GlossEntry[]
}

// The "spot the liar" case: compare the statements against the established facts and
// accuse whoever contradicts them.
function WhodunitGame({ data }: { data: Whodunit }) {
  const [solved, setSolved] = useState(false)
  const [ruledOut, setRuledOut] = useState<Set<string>>(new Set())

  const accuse = (s: Suspect) => {
    if (solved) return
    if (s.guilty) setSolved(true)
    else setRuledOut((prev) => new Set(prev).add(s.name))
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">🕵️ Sen çöz: Kim yaptı?</h2>
      <p className="mt-2 text-gray-700">{data.intro}</p>

      <div className="mt-4 rounded-lg bg-gray-900/95 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-400">
          🔍 Fakten — kesin bilgiler
        </p>
        <ul className="mt-2 space-y-1.5">
          {data.facts.map((f) => (
            <li key={f} className="text-sm text-gray-100">
              <span className="mr-1.5 text-brand-400">›</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {data.glossar && data.glossar.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            📖 Kelime yardımı
          </p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {data.glossar.map((g) => (
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

      <p className="mt-4 font-medium text-brand-800">{data.prompt}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {data.suspects.map((s) => {
          const guiltyShown = solved && s.guilty
          const out = ruledOut.has(s.name)
          return (
            <div
              key={s.name}
              className={`rounded-lg border p-4 ${
                guiltyShown
                  ? 'border-green-500 bg-green-50'
                  : out
                    ? 'border-gray-200 bg-gray-50 opacity-70'
                    : 'border-gray-200 bg-white'
              }`}
            >
              <p className="font-semibold text-gray-800">
                {s.name} <span className="text-sm font-normal text-gray-500">· {s.role}</span>
              </p>
              <p className="mt-1 text-sm italic text-gray-700">
                {s.de}
                <SpeakButton text={s.de} />
              </p>
              {guiltyShown ? (
                <p className="mt-2 text-sm font-medium text-green-700">✓ Suçlu! {s.reason}</p>
              ) : out ? (
                <p className="mt-2 text-sm text-gray-500">✗ Suçlu değil — {s.reason}</p>
              ) : (
                <button
                  onClick={() => accuse(s)}
                  disabled={solved}
                  className="mt-3 rounded-lg border border-brand-600 px-3 py-1 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                >
                  Bunu suçla
                </button>
              )}
            </div>
          )
        })}
      </div>

      {solved && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
          <Mascot mood="celebrate" className="mt-0.5 w-10 shrink-0" />
          <p className="text-sm font-medium text-green-800">{data.solved}</p>
        </div>
      )}
    </section>
  )
}

export default WhodunitGame
