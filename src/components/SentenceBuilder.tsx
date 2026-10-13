import { useState } from 'react'
import { language } from '../lib/language'
import { t } from '../i18n'
import SpeakButton from './SpeakButton'
import TipBox from './TipBox'
import { shuffle } from '../lib/shuffle'

export type Role =
  | 'özne'
  | 'fiil'
  | 'yardımcı'
  | 'partizip'
  | 'orta'
  | 'zaman'
  | 'bağlaç'
  | 'soru'
  | 'mastar'
  | 'nesne'
  | 'yer'

export type SentenceElement = { w: string; r: Role }

const roleStyles: Record<Role, string> = {
  özne: 'bg-violet-100 text-violet-800 ring-violet-300',
  fiil: 'bg-amber-100 text-amber-800 ring-amber-300',
  yardımcı: 'bg-amber-100 text-amber-800 ring-amber-300',
  partizip: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  orta: 'bg-sky-100 text-sky-800 ring-sky-300',
  zaman: 'bg-rose-100 text-rose-800 ring-rose-300',
  bağlaç: 'bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-300',
  soru: 'bg-indigo-100 text-indigo-800 ring-indigo-300',
  mastar: 'bg-teal-100 text-teal-800 ring-teal-300',
  nesne: 'bg-sky-100 text-sky-800 ring-sky-300',
  yer: 'bg-lime-100 text-lime-800 ring-lime-300',
}

// The captions under the chips name grammatical roles, so they follow the taught
// language (German has a Partizip II and a Mittelfeld, English has neither): they come
// from the content pack (language.json → sentenceBuilder), in the reader's language.
const roleLabels = (language.sentenceBuilder?.roles ?? {}) as Partial<Record<Role, string>>

const orderTip = language.sentenceBuilder?.orderTip ?? ''

export type BuilderLabels = {
  empty: string
  check: string
  clear: string
  success: string
  fail: string
  continue: string
}

const defaultLabels: BuilderLabels = {
  empty: t.builder.empty,
  check: t.builder.check,
  clear: t.builder.clear,
  success: t.builder.success,
  fail: t.builder.fail,
  continue: t.builder.continue,
}

// Punctuation belongs to the full sentence text only; it is dropped when comparing word
// sequences (see the almanca-ders skill, satzbau rule). Case is ignored too: the chips
// carry fixed spellings, so the only difference is the capital on the first word — which
// moves when an altSentence fronts another element.
const norm = (s: string) =>
  s.replace(/[.,?!]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

// When moving to the next sentence the parent must reset state by passing key={sentence}
function SentenceBuilder({
  sentence,
  tr,
  parts,
  distractors = [],
  altSentences = [],
  tipWrong,
  tipOrder,
  onSolved,
  onResult,
  labels: labelOverrides,
}: {
  sentence: string
  tr: string
  parts: SentenceElement[]
  distractors?: SentenceElement[]
  // The same words in another valid order (e.g. when time/object order is free in the
  // Mittelfeld). Building ANY of these counts as correct; the success screen shows the
  // canonical `sentence` and lists the rest as other accepted orderings.
  altSentences?: string[]
  tipWrong?: string
  tipOrder?: string
  onSolved: () => void
  onResult?: (result: 'success' | 'fail' | null) => void
  labels?: Partial<BuilderLabels>
}) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const [elements] = useState<SentenceElement[]>(() =>
    shuffle([...parts, ...distractors]),
  )
  const [beaker, setBeaker] = useState<number[]>([])
  const [result, setResult] = useState<'success' | 'fail' | null>(null)

  const attemptWords = beaker.map((i) => elements[i].w)
  const attempt = attemptWords.join(' ')
  const normAttempt = norm(attempt)
  const acceptedSentences = [sentence, ...altSentences]
  const otherAcceptedSentences = acceptedSentences.filter(
    (s) => norm(s) !== normAttempt,
  )

  const check = () => {
    if (beaker.length === 0 || result !== null) return
    const next = acceptedSentences.some((s) => norm(s) === normAttempt)
      ? 'success'
      : 'fail'
    setResult(next)
    onResult?.(next)
  }

  const failTip = (): string => {
    const correctWords = parts.map((p) => p.w)
    if (attemptWords.some((w) => !correctWords.includes(w)))
      return tipWrong ?? tipOrder ?? orderTip
    if (attemptWords.length < correctWords.length)
      return t.builder.missing
    return tipOrder ?? orderTip
  }

  const retry = () => {
    setBeaker([])
    setResult(null)
    onResult?.(null)
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        {elements.map((el, i) => {
          const used = beaker.includes(i)
          return (
            <button
              key={`${el.w}-${i}`}
              onClick={() => {
                if (result === null && !used) setBeaker((b) => [...b, i])
              }}
              disabled={used || result !== null}
              className={`rounded-lg px-4 py-2 text-base font-bold ring-1 transition ${roleStyles[el.r]} ${
                used ? 'opacity-25' : 'hover:scale-105'
              }`}
            >
              {el.w}
              <span className="block text-[10px] font-medium opacity-70">
                {roleLabels[el.r]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-5 min-h-24 rounded-t-lg rounded-b-3xl border-2 border-dashed border-sky-300 bg-sky-50 p-4">
        {beaker.length === 0 ? (
          <p className="text-center text-sm text-sky-400">{labels.empty}</p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {beaker.map((elIndex, pos) => (
              <span key={pos} className="flex items-center gap-1.5">
                {pos > 0 && <span className="text-sky-400">+</span>}
                <button
                  onClick={() => {
                    if (result === null)
                      setBeaker((b) => b.filter((_, p) => p !== pos))
                  }}
                  title={t.builder.remove}
                  className={`rounded-lg px-3 py-1.5 font-bold ring-1 ${roleStyles[elements[elIndex].r]}`}
                >
                  {elements[elIndex].w}
                </button>
              </span>
            ))}
          </div>
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
            {labels.success}{' '}
            <strong className="italic">
              {acceptedSentences.find((s) => norm(s) === normAttempt) ??
                sentence}
            </strong>
            <SpeakButton text={sentence} />
            <span className="block text-sm text-green-700">{tr}</span>
            {otherAcceptedSentences.length > 0 && (
              <span className="mt-2 block text-sm text-green-700">
                {t.builder.otherOrders}{' '}
                {otherAcceptedSentences.map((s, i) => (
                  <span key={s}>
                    {i > 0 && ' · '}
                    <em className="italic">{s}</em>
                  </span>
                ))}
              </span>
            )}
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
            {labels.fail}{' '}
            {t.builder.notASentence(<span className="italic">&ldquo;{attempt}&rdquo;</span>)}
          </div>
          <TipBox className="mt-3">{failTip()}</TipBox>
          <button
            onClick={retry}
            className="mt-4 w-full rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            {t.quiz.retry}
          </button>
        </>
      )}
    </div>
  )
}

export default SentenceBuilder
