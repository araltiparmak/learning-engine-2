import { Suspense, lazy, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Settings from './pages/Settings'
import ScrollToTop from './components/ScrollToTop'
import NotesWidget from './components/NotesWidget'
import config from './config'
import type { NavItem } from './config/types'
import { brand } from './config/lang'
import { t, fromLang, fromLangs, switchFromLang, LANG_NAMES, type FromLang } from './i18n'
import { pageRoutes, LessonsIndex } from './routes'

// Heavy, rarely visited pages go into their own chunk and are not downloaded on first
// paint. The lesson pages belong here too: the lesson documents plus the sources/ data
// feeding them run to a few hundred kilobytes and are needed on these pages only.
const LessonPage = lazy(() => import('./pages/LessonPage'))
const NotesPage = lazy(() => import('./pages/NotesPage'))
const Quiz = lazy(() => import('./pages/Quiz'))
const QuizPage = lazy(() => import('./pages/QuizPage'))

const navItems = config.nav

// The lessons index is a card grid and wants a wider column than the reading pages.
// Header, nav and footer follow the same width so the wordmark keeps sitting on the
// content column's left edge.
const WIDE_PATHS = ['/dersler']

// One accent (the theme's `brand` colour) carries the wordmark, active state and links.
// Inactive items stay neutral so the active one is the only coloured thing in the row.
const deskLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-1.5 py-2 text-sm whitespace-nowrap transition ${
    isActive
      ? 'font-semibold text-brand-700 underline decoration-accent-500 decoration-2 underline-offset-[6px]'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`

// A nav item is also active on the other tabs of its page (NavItem.also).
const activeFor = (item: NavItem, pathname: string) => (isActive: boolean) =>
  isActive || !!item.also?.some((path) => pathname.startsWith(path))

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm transition ${
    isActive ? 'bg-brand-50 font-semibold text-brand-700 shadow-[inset_3px_0_0_var(--accent-500)]' : 'text-gray-700 hover:bg-gray-100'
  }`

// The explanation-language menu. Only sites that offer more than one language get it
// (see LangConfig); choosing stores the pick and reloads, since the language is a
// constant for a page load (src/i18n/lang.ts).
function LangMenu({ className = '' }: { className?: string }) {
  if (fromLangs.length < 2) return null
  return (
    <select
      value={fromLang}
      onChange={(e) => switchFromLang(e.target.value as FromLang)}
      aria-label={t.shell.langMenu}
      title={t.shell.langMenu}
      className={`rounded-md border border-gray-200 bg-white py-1 pr-7 pl-2 text-sm text-gray-700 transition hover:border-brand-400 focus:border-brand-400 focus:outline-none ${className}`}
    >
      {fromLangs.map((lang) => (
        <option key={lang} value={lang}>
          {LANG_NAMES[lang]}
        </option>
      ))}
    </select>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  // A lesson page is the widest: up to three columns (section lessons, text, contents).
  const shell = pathname.startsWith('/dersler/')
    ? 'max-w-7xl'
    : WIDE_PATHS.includes(pathname)
      ? 'max-w-6xl'
      : 'max-w-4xl'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 shadow-[inset_0_3px_0_var(--accent-500)] backdrop-blur">
        {/* Same max-width as <main> so the wordmark sits on the content column's left
            edge. Two layouts: on tablets the brand stays left and the nav is pushed to
            the right edge, from lg on three columns with the outer two equal so the nav
            is centred against the PAGE. The nav only fits beside the wordmark because
            its items are padded tightly — widening them wraps the wordmark. It opens at
            52rem rather than md (48rem); below that the menu button takes over. */}
        <div
          className={`mx-auto grid h-14 ${shell} grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-0`}
        >
          {/* The only route home: there is no "Ana Sayfa" nav item, the wordmark is it. */}
          <NavLink
            to="/"
            title={t.shell.home}
            className="text-base font-bold whitespace-nowrap tracking-tight text-brand-600"
          >
            {brand}
          </NavLink>

          <nav aria-label={t.shell.mainMenu} className="hidden items-center justify-end min-[52rem]:flex lg:justify-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? item.to === '/'}
                className={({ isActive }) => deskLink({ isActive: activeFor(item, pathname)(isActive) })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* The explanation-language menu lives in the footer only. Notes are personal,
              not a section of the course, so they sit here as an icon on every width. */}
          <div className="flex items-center gap-1 justify-self-end">
            <NavLink
              to="/notlar"
              aria-label={t.shell.notes}
              title={t.shell.notes}
              className={({ isActive }) =>
                `rounded-md p-2 transition ${isActive ? 'text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
              }
            >
              {({ isActive }) => (
                <svg viewBox="0 0 24 24" className="size-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 3.75h12a.75.75 0 0 1 .75.75v16.19a.375.375 0 0 1-.58.31L12 17.25 5.83 21a.375.375 0 0 1-.58-.31V4.5A.75.75 0 0 1 6 3.75Z" />
                </svg>
              )}
            </NavLink>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? t.shell.closeMenu : t.shell.openMenu}
              aria-expanded={menuOpen}
              className="rounded-md p-2 text-xl leading-none text-gray-700 hover:bg-gray-100 min-[52rem]:hidden"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label={t.shell.mainMenu}
            className={`mx-auto flex ${shell} flex-col gap-0.5 border-t border-gray-100 px-4 py-3 sm:px-6 min-[52rem]:hidden`}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? item.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => mobileLink({ isActive: activeFor(item, pathname)(isActive) })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className={`mx-auto w-full ${shell} flex-1 px-4 py-10 sm:px-6`}>
        <Suspense fallback={<p className="text-gray-400">{t.shell.loading}</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hakkinda" element={<About />} />
            <Route path="/ayarlar" element={<Settings />} />
            {/* The lesson index depends on the content pack (see src/routes.tsx) */}
            <Route path="/dersler" element={<LessonsIndex />} />
            <Route path="/notlar" element={<NotesPage />} />
            {/* Favourites merged into the notes page; the old path still resolves. */}
            <Route path="/favoriler" element={<NotesPage />} />
            {/* All lessons come from JSON (the active language's index) through one generic page */}
            <Route path="/dersler/:slug" element={<LessonPage />} />
            {/* Quizzes come from a single registry (content/<target>/quizzes.json); the engine is picked by slug */}
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:slug" element={<QuizPage />} />
            {/* Pages whose data the content pack carries (see src/routes.tsx) */}
            {pageRoutes}
          </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className={`mx-auto ${shell} px-4 py-8 text-sm sm:px-6`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div className="max-w-sm">
              <p className="font-bold tracking-tight text-brand-600">{brand}</p>
              <p className="mt-1.5 text-gray-500">{config.about.intro}</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <LangMenu className="self-start sm:self-end" />
              <NavLink to="/hakkinda" className="text-gray-600 hover:text-gray-900">
                {t.shell.about}
              </NavLink>
              <NavLink to="/ayarlar" className="text-gray-600 hover:text-gray-900">
                {t.shell.settings}
              </NavLink>
              {config.about.siblings.map((site) => (
                <a
                  key={site.url}
                  href={site.url}
                  className="text-gray-600 hover:text-gray-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  {site.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <NotesWidget />
    </div>
  )
}

export default App
