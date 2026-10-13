type Point = { pattern: string; body: string; examples: string }
type EnglishData = { heading: string; intro: string; points: Point[] }

// A bridge box for Turkish speakers who know English (optional; renders nothing without
// data). The explanations are in Turkish and the examples show the English parallel.
// Data: <lesson>.json → "english".
function EnglishBridge({ data }: { data?: EnglishData }) {
  if (!data) return null
  return (
    <section className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-5">
      <div className="flex items-center gap-2">
        <span className="rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          EN
        </span>
        <h2 className="text-lg font-semibold text-sky-900">{data.heading}</h2>
      </div>
      <p className="mt-2 text-sm text-sky-950/80">{data.intro}</p>
      <ul className="mt-4 space-y-3">
        {data.points.map((p) => (
          <li key={p.pattern} className="border-l-2 border-sky-300 pl-3">
            <p className="font-semibold text-sky-900">{p.pattern}</p>
            <p className="mt-0.5 text-sm text-sky-950/80">{p.body}</p>
            <p className="mt-1 text-sm italic text-sky-700">{p.examples}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default EnglishBridge
