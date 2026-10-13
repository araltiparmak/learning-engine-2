import { useState } from 'react'
import { shuffle } from '../lib/shuffle'

// The game of putting e-mail sentences into the right order (SentenceBuilder at line
// level — no role colours, because whole sentences/lines are what gets ordered).
export type OrderLabels = {
  empty: string
  check: string
  clear: string
  success: string
  fail: string
  continue: string
}

const defaultLabels: OrderLabels = {
  empty: 'Cümlelere sırayla tıklayarak e-postayı kur',
  check: 'Kontrol et',
  clear: 'Boşalt',
  success: 'Doğru sırada! 🎉',
  fail: 'Sıra yanlış!',
  continue: 'Devam →',
}

// When moving to the next e-mail the parent must reset state via key={lines.join('|')}
function EmailOrderBuilder({
  lines,
  tr,
  tip,
  onSolved,
  onResult,
  labels: labelOverrides,
}: {
  lines: string[]
  tr?: string
  tip?: string
  onSolved: () => void
  onResult?: (result: 'success' | 'fail' | null) => void
  labels?: Partial<OrderLabels>
}) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const [elements] = useState<string[]>(() => shuffle(lines))
  const [beaker, setBeaker] = useState<number[]>([])
  const [result, setResult] = useState<'success' | 'fail' | null>(null)

  const attempt = beaker.map((i) => elements[i])

  const check = () => {
    if (beaker.length === 0 || result !== null) return
    const next =
      attempt.length === lines.length && attempt.every((l, i) => l === lines[i])
        ? 'success'
        : 'fail'
    setResult(next)
    onResult?.(next)
  }

  const retry = () => {
    setBeaker([])
    setResult(null)
    onResult?.(null)
  }

  return (
    <div>
      <div className="mt-4 flex flex-col gap-2">
        {elements.map((line, i) => {
          const used = beaker.includes(i)
          return (
            <button
              key={i}
              onClick={() => {
                if (result === null && !used) setBeaker((b) => [...b, i])
              }}
              disabled={used || result !== null}
              className={`rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-left text-sm font-medium text-sky-900 transition ${
                used ? 'opacity-25' : 'hover:border-sky-400 hover:scale-[1.01]'
              }`}
            >
              {line}
            </button>
          )
        })}
      </div>

      <div className="mt-5 min-h-24 rounded-t-lg rounded-b-3xl border-2 border-dashed border-brand-300 bg-brand-50 p-4">
        {beaker.length === 0 ? (
          <p className="text-center text-sm text-brand-500">{labels.empty}</p>
        ) : (
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-gray-800">
            {beaker.map((elIndex, pos) => (
              <li key={pos}>
                <button
                  onClick={() => {
                    if (result === null) setBeaker((b) => b.filter((_, p) => p !== pos))
                  }}
                  title="Çıkar"
                  className="text-left hover:underline"
                >
                  {elements[elIndex]}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {result === null && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={check}
            disabled={beaker.length === 0}
            className="flex-1 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            {labels.check}
          </button>
          <button
            onClick={retry}
            disabled={beaker.length === 0}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-600 transition hover:border-brand-400 disabled:opacity-40"
          >
            {labels.clear}
          </button>
        </div>
      )}

      {result === 'success' && (
        <>
          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800">
            {labels.success}
            {tr && <span className="mt-1 block text-sm text-green-700">{tr}</span>}
          </div>
          <button
            onClick={onSolved}
            className="mt-4 w-full rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            {labels.continue}
          </button>
        </>
      )}

      {result === 'fail' && (
        <>
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            {labels.fail}
            {tip && <span className="mt-1 block text-sm text-red-700">{tip}</span>}
          </div>
          <button
            onClick={retry}
            className="mt-4 w-full rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            Tekrar dene
          </button>
        </>
      )}
    </div>
  )
}

export default EmailOrderBuilder
