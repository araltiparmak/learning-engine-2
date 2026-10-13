import { useParams } from 'react-router'
import ListeningTestView from '../components/ListeningTestView'
import { BackLink, NotFound, PrevNextNav } from '../components/DetailPage'
import { listeningTests } from '../lib/listening'
import { findWithNeighbors } from '../lib/neighbors'

const BACK = '← Dinleme testlerine dön'
const linkTo = (t: { id: string; title: string }) => ({ to: `/dinleme/${t.id}`, label: t.title })

function ListeningDetail() {
  const { id } = useParams()
  const found = findWithNeighbors(listeningTests, id)
  if (!found) return <NotFound back="/dinleme" backLabel={BACK} message="Bu kayıt bulunamadı. 🎧" />

  const { item: t, prev, next } = found
  return (
    <section className="max-w-2xl">
      <BackLink to="/dinleme">{BACK}</BackLink>

      <h1 className="mt-2 text-3xl font-bold">
        <span className="mr-2">{t.emoji}</span>
        {t.title}
      </h1>
      <p className="mt-1 text-gray-500">{t.titleTr}</p>

      <ListeningTestView test={t} />

      <PrevNextNav prev={prev && linkTo(prev)} next={next && linkTo(next)} />
    </section>
  )
}

export default ListeningDetail
