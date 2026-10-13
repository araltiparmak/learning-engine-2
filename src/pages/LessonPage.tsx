import { use, useMemo } from 'react'
import { useParams } from 'react-router'
import LessonRenderer, { lessonContents } from '../components/LessonRenderer'
import LessonSidebar from '../components/LessonSidebar'
import LessonCourseNav from '../components/LessonCourseNav'
import LessonQuizzes from '../components/quiz/LessonQuizzes'
import LessonWriting from '../components/LessonWriting'
import LessonReview from '../components/LessonReview'
import LessonFinish from '../components/LessonFinish'
import LessonNav from '../components/LessonNav'
import ReadingProgress from '../components/ReadingProgress'
import { NotFound } from '../components/DetailPage'
import { hasLesson, hasTurkishLesson, lessonMinutes, loadLesson } from '../data/lessons'
import { quizzesForLesson } from '../data/quizzes'
import { t, fromLang, felixAvailable, switchFromLang } from '../i18n'

// The one generic page for JSON-generated lessons: finds the document by slug, from the
// active language. Order: lesson content → its quizzes → a writing attempt → short recap
// → the closing card (study count + favourite) → previous/next lesson.
function LessonPage() {
  const { slug } = useParams()
  if (!slug || !hasLesson(slug)) {
    return (
      <NotFound back="/dersler" backLabel={t.lesson.backToList} message={t.lesson.notFound}>
        {/* A lesson not written in the reader's language yet may exist in Turkish —
            links inside a translated lesson can point at one. */}
        {slug && fromLang !== 'tr' && hasTurkishLesson(slug) && (
          <button
            type="button"
            onClick={() => switchFromLang('tr')}
            className="mt-4 rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            {t.lesson.readInTurkish}
          </button>
        )}
      </NotFound>
    )
  }
  return <LoadedLesson slug={slug} />
}

// Suspends until the document and every source it draws have arrived (see loadLesson).
function LoadedLesson({ slug }: { slug: string }) {
  const doc = use(loadLesson(slug))!
  // The sections this page adds under the document also get a line in the contents box,
  // so the reader can jump straight to the quiz.
  const extraContents = useMemo(
    () => [
      ...(quizzesForLesson(slug).length > 0 ? [{ id: 'kendini-test-et', label: t.lesson.testYourself }] : []),
      ...(felixAvailable ? [{ id: 'kendin-yaz', label: t.lesson.writeYourself }] : []),
    ],
    [slug],
  )
  const contents = useMemo(() => lessonContents(doc, extraContents), [doc, extraContents])
  const body = (
    <>
      <LessonRenderer
        lesson={doc}
        slug={slug}
        minutes={lessonMinutes(slug)}
        extraContents={extraContents}
        sideContents={contents.length > 0}
      />
      <LessonQuizzes slug={slug} />
      {felixAvailable && <LessonWriting title={doc.title} />}
      <LessonReview review={doc.review} />
      <LessonFinish slug={slug} />
      <LessonNav slug={slug} />
    </>
  )
  // Columns by width: one column on phones and tablets; from lg the contents list sits
  // left of the text; from 90rem the section's lessons take the far left and the contents
  // move to the right. A short lesson has no contents list, so below 90rem it stays one
  // centred column and above it the empty right column keeps the text centred.
  const hasContents = contents.length > 0
  return (
    <>
      <ReadingProgress />
      <div
        className={`min-[90rem]:grid min-[90rem]:grid-cols-[14rem_minmax(0,1fr)_13rem] min-[90rem]:gap-10 ${
          hasContents ? 'lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12' : ''
        }`}
      >
        <aside className="hidden min-[90rem]:col-start-1 min-[90rem]:row-start-1 min-[90rem]:block">
          <LessonCourseNav slug={slug} />
        </aside>
        {hasContents && (
          <aside className="hidden lg:col-start-1 lg:row-start-1 lg:block min-[90rem]:col-start-3">
            <LessonSidebar contents={contents} />
          </aside>
        )}
        <div
          className={`min-w-0 min-[90rem]:col-start-2 min-[90rem]:row-start-1 min-[90rem]:mx-0 ${
            hasContents ? 'lg:col-start-2 lg:row-start-1' : 'mx-auto max-w-3xl'
          }`}
        >
          {body}
        </div>
      </div>
    </>
  )
}

export default LessonPage
