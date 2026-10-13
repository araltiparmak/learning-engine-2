import { useParams } from 'react-router'
import LessonRenderer from '../components/LessonRenderer'
import { BackLink, NotFound, PrevNextNav } from '../components/DetailPage'
import { speakingLessons } from '../lib/speaking'
import { findWithNeighbors } from '../lib/neighbors'

const BACK = '← Konuşma derslerine dön'
const linkTo = (l: { id: string; title: string }) => ({ to: `/konusma/${l.id}`, label: l.title })

// Speaking lessons are lesson documents too (an ordered `blocks` array), so they use the
// same LessonRenderer as the grammar lessons — only their data comes from sprechen.json
// rather than the /dersler list. No `slug` is passed: favourite blocks belong to the
// grammar lessons.
function SpeakingDetail() {
  const { id } = useParams()
  const found = findWithNeighbors(speakingLessons, id)
  if (!found) return <NotFound back="/konusma" backLabel={BACK} message="Bu ders bulunamadı. 🗣️" />

  const { item: lesson, prev, next } = found
  return (
    <section className="max-w-2xl">
      <BackLink to="/konusma">{BACK}</BackLink>

      <div className="mt-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {lesson.method}
        </p>
        <p className="mt-1 text-sm text-gray-700">{lesson.methodNote}</p>
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Hedef: </span>
          {lesson.ziel}
        </p>
      </div>

      <LessonRenderer lesson={lesson.doc} showBack={false} />

      <PrevNextNav prev={prev && linkTo(prev)} next={next && linkTo(next)} />
    </section>
  )
}

export default SpeakingDetail
