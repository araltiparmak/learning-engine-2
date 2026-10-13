import { lazy, type ComponentProps, type ComponentType } from 'react'
import { Navigate, Route } from 'react-router'
import { fromLang } from './i18n'
import type SavedFeedCardsPage from './components/feed/SavedFeedCards'

// The pages beyond lessons and quizzes, for every target. A page exists only when the
// target's content pack carries its data (content/<target>/pages/<file>.json):
// import.meta.env.VITE_PAGE_<file> is set by vite/contentUsage.ts, and a false flag lets
// the bundler drop the page — so a target without that data does not ship it even as an
// unused chunk. Each flag is written out in full: only the literal expression is replaced
// at build time. Every page is its own lazy chunk.

// Word study: sentence cards, the verb map and the core words are tabs of one page (their
// own routes, so old links such as /fiiller and /kelimeler keep resolving).
const WordStudy = import.meta.env.VITE_PAGE_kelimeler ? lazy(() => import('./pages/WordStudy')) : null
// Word games, Sprachberg and the detective cases are tabs of one page as well.
const Play = import.meta.env.VITE_PAGE_games ? lazy(() => import('./pages/Play')) : null
const CaseDetail = import.meta.env.VITE_PAGE_faelle ? lazy(() => import('./pages/CaseDetail')) : null
const GameSetPage = import.meta.env.VITE_PAGE_games ? lazy(() => import('./pages/GameSetPage')) : null
const Reading = import.meta.env.VITE_PAGE_lesen ? lazy(() => import('./pages/Reading')) : null
const ReadingDetail = import.meta.env.VITE_PAGE_lesen ? lazy(() => import('./pages/ReadingDetail')) : null
const Speaking = import.meta.env.VITE_PAGE_sprechen ? lazy(() => import('./pages/Speaking')) : null
const SpeakingDetail = import.meta.env.VITE_PAGE_sprechen ? lazy(() => import('./pages/SpeakingDetail')) : null
const Listening = import.meta.env.VITE_PAGE_listening ? lazy(() => import('./pages/Listening')) : null
const ListeningDetail = import.meta.env.VITE_PAGE_listening
  ? lazy(() => import('./pages/ListeningDetail'))
  : null
// Reels-style feed: a topic list and one feed per topic; the speaking feeds live in the
// same file and open from the speaking tab.
const FeedList = import.meta.env.VITE_PAGE_feed ? lazy(() => import('./pages/FeedList')) : null
const Feed = import.meta.env.VITE_PAGE_feed ? lazy(() => import('./pages/Feed')) : null
// Daily study plan: a list of days and one page per day.
const DailyPlan = import.meta.env.VITE_PAGE_dailyPlan ? lazy(() => import('./pages/DailyPlan')) : null
const DailyDay = import.meta.env.VITE_PAGE_dailyPlan ? lazy(() => import('./pages/DailyDay')) : null
// Felix's writing check. Advertised or not is the nav's business (content/<target>/site.json):
// the German site lists no entry for it, because every request costs Gemini tokens.
const WritingCheck = lazy(() => import('./pages/WritingCheck'))

// Saved feed cards, a section of the shared /notlar page; null without a feed.
export const SavedFeedCards: ComponentType<ComponentProps<typeof SavedFeedCardsPage>> | null =
  import.meta.env.VITE_PAGE_feed ? lazy(() => import('./components/feed/SavedFeedCards')) : null

// The lesson index (/dersler): the ordered lesson path when the pack has one, otherwise
// the tabbed list. The path's notes are written in Turkish only, so a reader of another
// explanation language keeps the tabbed list.
const LessonPath = import.meta.env.VITE_PAGE_lessonPath ? lazy(() => import('./pages/LessonPath')) : null
const Lessons = lazy(() => import('./pages/Lessons'))
export function LessonsIndex() {
  return LessonPath && fromLang === 'tr' ? <LessonPath /> : <Lessons />
}

export const pageRoutes = [
  WordStudy && <Route key="kelimeler" path="/kelimeler" element={<WordStudy />} />,
  WordStudy && <Route key="fiiller" path="/fiiller" element={<WordStudy />} />,
  WordStudy && <Route key="temel-kelimeler" path="/temel-kelimeler" element={<WordStudy />} />,
  Play && <Route key="oyunlar" path="/oyunlar" element={<Play />} />,
  Play && <Route key="sprachberg" path="/sprachberg" element={<Play />} />,
  Play && <Route key="vakalar" path="/vakalar" element={<Play />} />,
  CaseDetail && <Route key="vaka" path="/vakalar/:id" element={<CaseDetail />} />,
  GameSetPage && <Route key="oyun" path="/oyunlar/:id" element={<GameSetPage />} />,
  Reading && <Route key="okuma" path="/okuma" element={<Reading />} />,
  ReadingDetail && <Route key="okuma-metin" path="/okuma/:id" element={<ReadingDetail />} />,
  Speaking && <Route key="konusma" path="/konusma" element={<Speaking />} />,
  SpeakingDetail && <Route key="konusma-ders" path="/konusma/:id" element={<SpeakingDetail />} />,
  Feed && <Route key="konusma-akis" path="/konusma/akis/:id" element={<Feed track="speaking" />} />,
  Listening && <Route key="dinleme" path="/dinleme" element={<Listening />} />,
  ListeningDetail && <Route key="dinleme-test" path="/dinleme/:id" element={<ListeningDetail />} />,
  FeedList && <Route key="akis" path="/akis" element={<FeedList />} />,
  Feed && <Route key="akis-konu" path="/akis/:id" element={<Feed />} />,
  DailyPlan && <Route key="gunluk" path="/gunluk" element={<DailyPlan />} />,
  DailyDay && <Route key="gunluk-gun" path="/gunluk/:id" element={<DailyDay />} />,
  // The path was tried out at /yol before it became the lesson index.
  LessonPath && <Route key="yol" path="/yol" element={<Navigate to="/dersler" replace />} />,
  <Route key="yazma" path="/yazma" element={<WritingCheck />} />,
  // The page used to live at /korrektur and the link handed out carries a key in the
  // query string; the old path stays so that link keeps working.
  <Route key="korrektur" path="/korrektur" element={<WritingCheck />} />,
]
