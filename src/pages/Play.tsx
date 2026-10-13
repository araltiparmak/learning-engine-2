import { Suspense, lazy } from 'react'
import { NavLink, useLocation } from 'react-router'
import pageMeta from '#content/pages/pageMeta.json'
import { t } from '../i18n'

// Games under one nav entry, like WordStudy: each tab is its own ROUTE (/oyunlar,
// /sprachberg, /vakalar) so old links and bookmarks keep working. The tabs are lazy so
// opening one does not download the others' data (faelle.json, cumleYolu.json). A tab
// whose data the content pack lacks is left out of the build (see src/routes.tsx).
const Games = lazy(() => import('./Games'))
const CumleYolu = import.meta.env.VITE_PAGE_cumleYolu ? lazy(() => import('./CumleYolu')) : null
const Cases = import.meta.env.VITE_PAGE_faelle ? lazy(() => import('./Cases')) : null

const tabs = [
  { to: '/oyunlar', label: 'Kelime oyunları', page: Games },
  { to: '/sprachberg', label: 'Sprachberg', page: CumleYolu },
  { to: '/vakalar', label: 'Vakalar', page: Cases },
].filter((tab) => tab.page)

function Play() {
  const { pathname } = useLocation()
  const Tab = tabs.find((item) => pathname.startsWith(item.to))?.page ?? Games

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{pageMeta.oyunlar.title}</h1>
      <p className="mt-2 max-w-2xl text-gray-600">{pageMeta.oyunlar.intro}</p>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-gray-200">
        {tabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `-mb-px shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-6">
        <Suspense fallback={<p className="text-gray-400">{t.shell.loading}</p>}>
          <Tab />
        </Suspense>
      </div>
    </section>
  )
}

export default Play
