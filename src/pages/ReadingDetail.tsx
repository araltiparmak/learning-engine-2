import { useParams } from 'react-router'
import ReadingTextView from '../components/ReadingTextView'
import { BackLink, NotFound, PrevNextNav } from '../components/DetailPage'
import { readingTexts } from '../lib/reading'
import { findWithNeighbors } from '../lib/neighbors'

const BACK = '← Okuma parçalarına dön'
const linkTo = (t: { id: string; title: string }) => ({ to: `/okuma/${t.id}`, label: t.title })

function ReadingDetail() {
  const { id } = useParams()
  const found = findWithNeighbors(readingTexts, id)
  if (!found) return <NotFound back="/okuma" backLabel={BACK} message="Bu metin bulunamadı. 📖" />

  const { item: t, prev, next } = found
  return (
    <section className="max-w-2xl">
      <BackLink to="/okuma">{BACK}</BackLink>

      <h1 className="mt-2 text-3xl font-bold">
        <span className="mr-2">{t.emoji}</span>
        {t.title}
      </h1>
      <p className="mt-1 text-gray-500">{t.titleTr}</p>
      <ReadingTextView text={t} />

      <PrevNextNav prev={prev && linkTo(prev)} next={next && linkTo(next)} />
    </section>
  )
}

export default ReadingDetail
