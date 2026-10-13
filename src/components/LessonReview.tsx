import Mascot from './Mascot'
import { inline } from './inline'
import type { Review } from './LessonRenderer'
import { t } from '../i18n'

// The short recap box shown after the quiz and sentence building are done, just before
// the "next lesson" link. Fed by the optional `review` field in the lesson JSON;
// without it nothing renders (most existing lessons do not have the field yet).
function LessonReview({ review }: { review?: Review }) {
  if (!review || review.items.length === 0) return null
  return (
    <section className="mt-8 max-w-3xl rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Mascot mood="celebrate" className="w-9 shrink-0" />
        <p className="font-medium text-brand-800">{review.title ?? t.lesson.recap}</p>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        {review.items.map((it, i) => (
          <li key={i}>• {inline(it)}</li>
        ))}
      </ul>
    </section>
  )
}

export default LessonReview
