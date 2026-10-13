import { useState } from 'react'
import { getFavoriteLessons, toggleFavoriteLesson } from '../lib/favorites'
import { t } from '../i18n'

// Star for the whole lesson, next to the review buttons. Separate from the row-level
// saving inside the lesson (see lib/favorites.ts): this one marks the lesson itself and
// shows up as the "★ Favorilerim" tab on the lessons page.
function LessonFavorite({ slug }: { slug: string }) {
  const [on, setOn] = useState(() => getFavoriteLessons().has(slug))

  return (
    <div>
      <button
        type="button"
        onClick={() => setOn(toggleFavoriteLesson(slug))}
        aria-pressed={on}
        className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
          on
            ? 'border-brand-300 bg-brand-50 text-brand-800'
            : 'border-gray-200 bg-white text-gray-600 hover:border-brand-400'
        }`}
      >
        {on ? t.lesson.inFavorites : t.lesson.addToFavorites}
      </button>
    </div>
  )
}

export default LessonFavorite
