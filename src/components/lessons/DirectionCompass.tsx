import SpeakButton from '../SpeakButton'

type Label = { de: string; tr?: string }
type Ring = { n: Label; o: Label; s: Label; w: Label }

function Chip({ label, tone }: { label: Label; tone: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border px-1.5 py-1 text-center text-[11px] leading-tight ${tone}`}
    >
      <span className="font-semibold">
        {label.de}
        <SpeakButton text={label.de} />
      </span>
      {label.tr && <span className="opacity-80">{label.tr}</span>}
    </div>
  )
}

// Shows the difference between nördlich von X (OUTSIDE the city, a neighbouring place)
// and im Norden von X (INSIDE it, a district) on two small maps side by side: the left
// card treats the city as a single point and marks the places around it, the right card
// treats it as an area and marks the districts within. The grid shape is identical in
// both; the only difference is the frame (= the city boundary) around the right card.
function DirectionCompass({ city, outer, inner }: { city: string; outer: Ring; inner: Ring }) {
  const outerTone = 'border-sky-200 bg-sky-50 text-sky-800'
  const innerTone = 'border-amber-200 bg-amber-100 text-amber-800'
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-center text-xs font-semibold text-sky-700">
          {city}'in DIŞINDA — komşu bir yer
        </p>
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
          <div />
          <Chip label={outer.n} tone={outerTone} />
          <div />
          <Chip label={outer.w} tone={outerTone} />
          <div className="flex items-center justify-center rounded-full border-2 border-gray-300 bg-white text-xs font-bold text-gray-700">
            {city}
          </div>
          <Chip label={outer.o} tone={outerTone} />
          <div />
          <Chip label={outer.s} tone={outerTone} />
          <div />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-center text-xs font-semibold text-amber-700">
          {city}'in İÇİNDE — bir bölge/semt
        </p>
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-1.5">
          <div />
          <Chip label={inner.n} tone={innerTone} />
          <div />
          <Chip label={inner.w} tone={innerTone} />
          <div className="flex items-center justify-center text-xs font-bold text-amber-900">
            {city}
          </div>
          <Chip label={inner.o} tone={innerTone} />
          <div />
          <Chip label={inner.s} tone={innerTone} />
          <div />
        </div>
      </div>
    </div>
  )
}

export default DirectionCompass
