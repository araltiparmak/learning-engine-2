import { Link } from 'react-router'
import { findSavedCard } from '../../lib/feed'
import { SavedCardBody } from './cards'
import { t } from '../../i18n'

// Saved feed cards on /notlar, laid out like the saved lesson rows above them. A German-only
// section: it reaches NotesPage through src/routes.tsx, so feed.json stays out of builds without a feed.
function SavedFeedCards({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  return ids.map((id) => {
    const found = findSavedCard(id)
    if (!found) return null
    const { feed, topic, card } = found
    return (
      <div key={id} className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`${feed.path}/${topic.id}`}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              {topic.emoji} {topic.title} →
            </Link>
            <span className="block text-xs text-gray-400">{t.notes.kindFeed}</span>
          </div>
          <button
            onClick={() => onRemove(id)}
            title={t.notes.unsave}
            className="shrink-0 rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-500 transition hover:border-gray-400 hover:text-gray-700"
          >
            {t.notes.remove}
          </button>
        </div>
        <SavedCardBody card={card} topic={topic} />
      </div>
    )
  })
}

export default SavedFeedCards
