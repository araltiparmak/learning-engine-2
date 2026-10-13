import SpeakButton from '../SpeakButton'
import { language } from '../../lib/language'
import { TONES } from '../../lib/tones'

// The legend comes from the content pack (language.json → caseFlow): which cases exist,
// the question each answers, its role and its tone. A part names one by its key.
const CASES = language.caseFlow?.cases ?? {}
const UNTAGGED = language.caseFlow?.untagged ?? ''

export type CasePart = { w: string; kasus?: string; note?: string }
export type CaseFlowItem = { de: string; tr: string; parts: CasePart[] }

// Splits a sentence into parts coloured by case, so it is obvious at a glance which
// element answers which question. The colours match the legend above.
function CaseFlow({ items, legend = true }: { items: CaseFlowItem[]; legend?: boolean }) {
  return (
    <div className="mt-4">
      {legend && (
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(CASES).map(([k, c]) => {
            const tone = TONES[c.tone]
            return (
              <div key={k} className={`rounded-lg border p-3 text-center ${tone.card}`}>
                <p className="text-xl">{c.emoji}</p>
                <p className={`text-sm font-semibold ${tone.label}`}>{k}</p>
                <p className="text-xs font-medium text-gray-600">{c.question}</p>
                <p className="mt-0.5 text-xs text-gray-500">{c.role}</p>
              </div>
            )
          })}
        </div>
      )}

      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.de} className="rounded-lg border border-gray-100 bg-white p-3">
            <div className="flex flex-wrap items-stretch gap-1.5">
              {item.parts.map((p, i) => {
                const c = p.kasus ? CASES[p.kasus] : null
                const tone = c && TONES[c.tone]
                const words = p.w.split(' ')
                return (
                  <div
                    key={`${p.w}-${i}`}
                    className={`min-w-0 rounded-lg border px-2.5 py-1.5 text-center ${
                      tone ? tone.chip : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="block text-sm text-gray-800">
                      {words.length > 1 ? (
                        <>
                          <strong className={tone ? tone.label : 'text-gray-700'}>{words[0]}</strong>{' '}
                          {words.slice(1).join(' ')}
                        </>
                      ) : (
                        p.w
                      )}
                    </span>
                    <span
                      className={`block text-[0.65rem] leading-tight ${
                        tone ? tone.label : 'text-gray-400'
                      }`}
                    >
                      {c ? `${c.emoji} ${p.kasus} · ${c.question}` : (p.note ?? UNTAGGED)}
                    </span>
                    {c && p.note && (
                      <span className="block text-[0.65rem] leading-tight text-gray-400">
                        {p.note}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              <span className="italic text-gray-700">{item.de}</span>
              <SpeakButton text={item.de} />
              <span className="block">{item.tr}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CaseFlow
