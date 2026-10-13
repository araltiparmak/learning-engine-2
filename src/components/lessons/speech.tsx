import { useState } from 'react'
import De from '../De'
import Mascot from '../Mascot'
import SpeakButton from '../SpeakButton'
import { useRevealed } from '../../lib/useRevealed'
import { shuffle } from '../../lib/shuffle'
import { useRowFavorites } from '../rowFavorites'

// Visual pieces specific to the speaking lessons (the /konusma tab). They live apart
// from the grammar blocks because their job differs: the goal here is not to show a
// rule but to keep a PHRASE ready on the tongue — so every one of them is short and
// carries a speak button. Data comes from the `props` field of the blocks in
// content/de/pages/sprechen.json.

type Phrase = { de: string; tr: string; note?: string; strength?: number }

// How "strong" a phrase is: the more filled ● circles, the more assertive it sounds.
function Strength({ value }: { value?: number }) {
  if (!value) return null
  return (
    <span
      className="ml-auto shrink-0 text-xs tracking-widest text-brand-500"
      title={`Kesinlik: ${value}/3`}
      aria-label={`Kesinlik ${value} / 3`}
    >
      {'●'.repeat(value)}
      <span className="text-gray-300">{'○'.repeat(3 - value)}</span>
    </span>
  )
}

// ——— Method A: the phrase bank ———
// Phrase cards grouped by function. Designed for scanning: while speaking, the learner
// should find the right shelf with their eyes in an instant.
export function SpeechPhrases({
  groups,
}: {
  groups: { title: string; note?: string; items: Phrase[] }[]
}) {
  const fav = useRowFavorites()
  const visible = (g: { items: Phrase[] }) => g.items.filter((p) => fav.shows(p.de))
  return (
    <div className="mt-4 space-y-5">
      {groups.filter((g) => visible(g).length > 0).map((g) => (
        <div key={g.title}>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{g.title}</p>
          {g.note && <p className="mt-0.5 text-sm text-gray-600">{g.note}</p>}
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {visible(g).map((p) => (
              <li
                key={p.de}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm"
              >
                {fav.save(p.de)}
                <div className="flex items-start gap-1.5">
                  <span className="font-medium text-gray-900">{p.de}</span>
                  <SpeakButton text={p.de} />
                  <Strength value={p.strength} />
                </div>
                <span className="mt-0.5 block text-gray-600">{p.tr}</span>
                {p.note && <span className="mt-1 block text-xs text-brand-700">{p.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// ——— Method B: learning inside a dialogue ———
// A real conversation; the phrases appear inside sentences, at the moment they are
// used. The Turkish is always visible: the point is not to decode the meaning but to
// see WHERE the phrase sits.
export function SpeechDialog({
  turns,
}: {
  turns: { who: string; de: string; tr: string; phrase?: string; note?: string }[]
}) {
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
              {t.phrase && (
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-xs">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 font-semibold text-brand-800">
                    {t.phrase}
                  </span>
                  {t.note && <span className="text-gray-600">{t.note}</span>}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ——— The tone ladder ———
// One idea, from the softest to the sharpest tone. What the learner really needs is not
// to know the phrase but to be able to GAUGE how blunt they are being.
export function SpeechLadder({
  topic,
  steps,
}: {
  topic?: string
  steps: { label: string; de: string; tr: string; note?: string }[]
}) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
      {topic && (
        <p className="text-sm text-gray-600">
          Aynı fikir, farklı tonlarda: <span className="font-medium text-gray-900">{topic}</span>
        </p>
      )}
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={s.de} className="flex items-start gap-3">
            <span className="mt-0.5 flex w-16 shrink-0 flex-col items-center">
              <span className="text-xs font-semibold text-brand-700">{s.label}</span>
              <span className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                <span
                  className="block h-1.5 rounded-full bg-brand-500"
                  style={{ width: `${((i + 1) / steps.length) * 100}%` }}
                />
              </span>
            </span>
            <span className="min-w-0">
              <span className="text-gray-900">
                {s.de}
                <SpeakButton text={s.de} />
              </span>
              <span className="block text-sm text-gray-500">{s.tr}</span>
              {s.note && <span className="mt-0.5 block text-xs text-brand-700">{s.note}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ——— Method C: the situation → response reflex ———
// Read the situation, say the answer TO YOURSELF, and only then reveal it. The goal is
// production, not recognition — which is why the options start hidden.
export function SpeechDrill({
  items,
}: {
  items: {
    situation: string
    situationTr: string
    options: { de: string; tr: string; tone: string }[]
  }[]
}) {
  const { isRevealed, toggle } = useRevealed()
  return (
    <div className="mt-4 space-y-3">
      {items.map((it, i) => (
        <div key={it.situation} className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Durum {i + 1}
          </p>
          <p className="mt-1 text-gray-900">
            {it.situation}
            <SpeakButton text={it.situation} />
          </p>
          <p className="mt-0.5 text-sm text-gray-500">{it.situationTr}</p>
          {isRevealed(i) ? (
            <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {it.options.map((o) => (
                <li key={o.de} className="text-sm">
                  <span className="mr-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {o.tone}
                  </span>
                  <span className="font-medium text-gray-900">
                    {o.de}
                    <SpeakButton text={o.de} />
                  </span>
                  <span className="block pl-1 text-gray-500">{o.tr}</span>
                </li>
              ))}
            </ul>
          ) : (
            <button
              onClick={() => toggle(i)}
              className="mt-3 rounded-lg bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 transition hover:bg-brand-200"
            >
              Önce sen söyle → sonra aç
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// Common mistakes: ❌ wrong ↔ ✅ right, at a glance.
export function SpeechMistakes({
  items,
}: {
  items: { wrong: string; right: string; why: string }[]
}) {
  const fav = useRowFavorites()
  return (
    <div className="mt-4 space-y-2">
      {items.filter((m) => fav.shows(m.wrong)).map((m) => (
        <div key={m.wrong} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
          {fav.save(m.wrong)}
          <p className="text-red-700 line-through decoration-red-300">❌ {m.wrong}</p>
          <p className="mt-1 font-medium text-green-800">
            ✅ {m.right}
            <SpeakButton text={m.right} />
          </p>
          <p className="mt-1 text-gray-600">{m.why}</p>
        </div>
      ))}
    </div>
  )
}

// ——— Method D: rebuilding the scene ———
// The learner gets the lines of a real conversation in a scrambled order and has to put
// them back together. Ordering forces them to ask WHY a line comes where it comes (a
// question answers a question, an exit line closes) — which is exactly the logic that is
// missing when a phrase is only memorised from a list. The Turkish and the speak buttons
// stay hidden until the scene is solved, so the first pass is really read in German.
type SceneTurn = { who: string; de: string; tr: string; note?: string }
type Scene = {
  title: string
  setup: string
  turns: SceneTurn[]
  punchline?: string
  tip?: string
}

function SceneCard({ scene }: { scene: Scene }) {
  const lines = scene.turns.map((t) => t.de)
  const [cards] = useState(() => shuffle(scene.turns))
  const [picked, setPicked] = useState<number[]>([])
  const [result, setResult] = useState<'success' | 'fail' | null>(null)
  const speakers = [...new Set(scene.turns.map((t) => t.who))]

  const check = () => {
    if (picked.length === 0 || result !== null) return
    const attempt = picked.map((i) => cards[i].de)
    setResult(
      attempt.length === lines.length && attempt.every((l, i) => l === lines[i])
        ? 'success'
        : 'fail',
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{scene.title}</p>
      <p className="mt-1 text-sm text-gray-600">{scene.setup}</p>

      {result === 'success' ? (
        <div className="mt-4 space-y-2">
          {scene.turns.map((t) => (
            <div
              key={t.de}
              className={`rounded-lg border px-3 py-2 ${
                t.who === speakers[0]
                  ? 'border-gray-200 bg-gray-50'
                  : 'ml-4 border-brand-200 bg-brand-50/60'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.who}</p>
              <p className="text-gray-900">
                {t.de}
                <SpeakButton text={t.de} />
              </p>
              <p className="text-sm text-gray-500">{t.tr}</p>
              {t.note && <p className="mt-1 text-xs text-brand-700">{t.note}</p>}
            </div>
          ))}
          <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2">
            <Mascot mood="celebrate" className="w-8 shrink-0" />
            <p className="text-sm text-green-800">
              Sahne tamam! 🎬 {scene.punchline && <span className="block">{scene.punchline}</span>}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-col gap-2">
            {cards.map((t, i) => {
              const used = picked.includes(i)
              return (
                <button
                  key={t.de}
                  onClick={() => !used && setPicked((p) => [...p, i])}
                  disabled={used}
                  className={`rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left text-sm text-sky-900 transition ${
                    used ? 'opacity-25' : 'hover:border-sky-400'
                  }`}
                >
                  <span className="mr-2 text-xs font-semibold uppercase text-sky-500">{t.who}</span>
                  {t.de}
                </button>
              )
            })}
          </div>

          <div className="mt-4 min-h-16 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 p-3">
            {picked.length === 0 ? (
              <p className="text-center text-sm text-brand-500">
                Replikleri konuşma sırasına göre tıkla
              </p>
            ) : (
              <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-800">
                {picked.map((cardIndex, pos) => (
                  <li key={pos}>
                    <button
                      onClick={() => setPicked((p) => p.filter((_, q) => q !== pos))}
                      title="Çıkar"
                      className="text-left hover:underline"
                    >
                      {cards[cardIndex].de}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {result === 'fail' && (
            <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              Sıra tutmadı. {scene.tip}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={check}
              disabled={picked.length === 0}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              Sahneyi kontrol et
            </button>
            <button
              onClick={() => {
                setPicked([])
                setResult(null)
              }}
              disabled={picked.length === 0}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:border-brand-400 disabled:opacity-40"
            >
              Boşalt
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function SpeechScene({ scenes }: { scenes: Scene[] }) {
  return (
    <div className="mt-4 space-y-4">
      {scenes.map((s) => (
        <SceneCard key={s.title} scene={s} />
      ))}
    </div>
  )
}

// The lesson's closing: three to five phrases worth pocketing. Felix does the reminding.
export function SpeechTakeaway({ items, de }: { items: string[]; de?: string }) {
  return (
    <div className="mt-6 rounded-xl border border-brand-300 bg-brand-50 p-5">
      <div className="flex items-center gap-2">
        <Mascot mood="teach" className="w-10 shrink-0" />
        <p className="font-semibold text-brand-900">Cebine at — bunlar yeter</p>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li key={it} className="text-sm text-gray-800">
            <span className="mr-1.5 text-brand-600">›</span>
            {it}
            <SpeakButton text={it} />
          </li>
        ))}
      </ul>
      {de && <De>{de}</De>}
    </div>
  )
}
