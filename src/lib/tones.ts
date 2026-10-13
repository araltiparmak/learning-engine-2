// The colour vocabulary content may name (`"tone": "violet"` in language.json), mapped to
// the Tailwind classes that draw it. Content names a tone, never a class: Tailwind only
// generates classes it finds written out in full, and the palette stays one decision.
//   chip   a small tagged part (CaseFlow, SentenceParts)
//   label  its caption
//   card   a larger box in the same colour (legend cards, TeKaMoLo cards)
export type Tone =
  | 'violet'
  | 'rose'
  | 'emerald'
  | 'amber'
  | 'orange'
  | 'teal'
  | 'sky'
  | 'slate'
  | 'slate-pale'
  | 'gray'
  | 'gray-pale'

type ToneClasses = { chip: string; label: string; card: string }

export const TONES: Record<Tone, ToneClasses> = {
  violet: { chip: 'border-violet-300 bg-violet-50', label: 'text-violet-700', card: 'border-violet-200 bg-violet-50' },
  rose: { chip: 'border-rose-300 bg-rose-50', label: 'text-rose-700', card: 'border-rose-200 bg-rose-50' },
  emerald: {
    chip: 'border-emerald-300 bg-emerald-50',
    label: 'text-emerald-700',
    card: 'border-emerald-200 bg-emerald-50',
  },
  amber: { chip: 'border-amber-300 bg-amber-50', label: 'text-amber-700', card: 'border-amber-200 bg-amber-50' },
  orange: { chip: 'border-orange-300 bg-orange-100', label: 'text-orange-800', card: 'border-orange-300 bg-orange-100' },
  teal: { chip: 'border-teal-300 bg-teal-50', label: 'text-teal-700', card: 'border-teal-200 bg-teal-50' },
  sky: { chip: 'border-sky-300 bg-sky-50', label: 'text-sky-700', card: 'border-sky-200 bg-sky-50' },
  slate: { chip: 'border-slate-300 bg-slate-100', label: 'text-slate-700', card: 'border-slate-200 bg-slate-100' },
  'slate-pale': { chip: 'border-slate-300 bg-slate-50', label: 'text-slate-600', card: 'border-slate-200 bg-slate-50' },
  gray: { chip: 'border-gray-300 bg-gray-100', label: 'text-gray-600', card: 'border-gray-200 bg-gray-100' },
  'gray-pale': { chip: 'border-gray-200 bg-gray-50', label: 'text-gray-500', card: 'border-gray-200 bg-gray-50' },
}
