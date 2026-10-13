import SpeakButton from '../SpeakButton'
import { useRowFavorites } from '../rowFavorites'
import { language } from '../../lib/language'
import { TONES } from '../../lib/tones'

// One finished sentence taken apart into the slots it is built from, in sentence order:
// the student sees WHICH element sits WHERE and which question it answers, instead of
// being told the order in prose.
//
// The slots come from the content pack (language.json → sentenceParts): each has a name,
// the question it answers and a tone. Tones are shared vocabulary, not decoration — the
// German pack colours the cases as CaseFlow does and gives the verb bracket and the
// TeKaMoLo adverbials their own.
//
// `name` and `q` on a part override the defaults — the same slot answers a different
// question in a different sentence ("wann?" vs "wie lange?"), and a finite verb that
// dropped to the end of a subordinate clause needs to say so.
const SLOTS = language.sentenceParts?.slots ?? {}
const FREE = SLOTS.free ?? { name: '', tone: 'gray-pale' as const }

export type SentencePart = { w: string; slot?: string; name?: string; q?: string }

// Punctuation lives in `sentence` only (as in the satzbau data): the chips carry bare
// words, so a comma never looks like part of an element.
function SentenceParts({
  sentence,
  tr,
  parts,
  note,
}: {
  sentence: string
  tr?: string
  parts: SentencePart[]
  note?: string
}) {
  const fav = useRowFavorites()
  if (!fav.shows(sentence)) return null
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
      <p className="text-sm">
        {fav.save(sentence)}
        <span className="italic text-gray-800">{sentence}</span>
        <SpeakButton text={sentence} />
        {tr && <span className="block text-gray-500">{tr}</span>}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {parts.map((p, i) => {
          const s = SLOTS[p.slot ?? 'free'] ?? FREE
          const tone = TONES[s.tone]
          const q = p.q ?? s.q
          return (
            <div
              key={`${p.w}-${i}`}
              className={`min-w-0 rounded-lg border px-2.5 py-1.5 text-center ${tone.chip} ${
                s.dashed ? 'border-dashed' : ''
              }`}
            >
              <span className="block text-sm text-gray-800">{p.w}</span>
              <span className={`block text-[0.65rem] leading-tight ${tone.label}`}>
                {p.name ?? s.name}
              </span>
              {q && <span className="block text-[0.65rem] leading-tight text-gray-400">{q}</span>}
            </div>
          )
        })}
      </div>

      {note && <p className="mt-3 text-xs text-brand-700">{note}</p>}
    </div>
  )
}

export default SentenceParts
