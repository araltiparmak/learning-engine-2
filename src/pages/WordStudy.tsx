import { NavLink, useLocation } from 'react-router'
import pageMeta from '#content/pages/pageMeta.json'
import Vocabulary from './Vocabulary'
import VerbMap from './VerbMap'
import CoreWords from './CoreWords'

// Study tools under one nav entry. Each tab is its own ROUTE — /kelimeler, /fiiller and
// /temel-kelimeler all render this shell — so old links and bookmarks keep working and
// each tab is its own back-button step. A tab whose data the content pack lacks is left
// out of the build (see src/routes.tsx).
const tabs = [
  { to: '/kelimeler', label: 'Cümle kartları', page: Vocabulary },
  { to: '/fiiller', label: 'Fiil haritası', page: import.meta.env.VITE_PAGE_fiilHaritasi && VerbMap },
  { to: '/temel-kelimeler', label: 'En önemli 500', page: import.meta.env.VITE_PAGE_coreWords && CoreWords },
].filter((tab) => tab.page)

function WordStudy() {
  const { pathname } = useLocation()
  const Tab = tabs.find((tab) => pathname.startsWith(tab.to))?.page || Vocabulary

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{pageMeta.kelimeCalismasi.title}</h1>
      <p className="mt-2 max-w-2xl text-gray-600">{pageMeta.kelimeCalismasi.intro}</p>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `-mb-px shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-6">
        <Tab />
      </div>
    </section>
  )
}

export default WordStudy
