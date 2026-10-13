import { Link, useParams } from 'react-router'
import De from '../components/De'
import Mascot from '../components/Mascot'
import SpeakButton from '../components/SpeakButton'
import CaseScene from '../components/CaseScene'
import FillBlankQuiz from '../components/quiz/FillBlankQuiz'
import { inlineQuiz } from '../data/quizzes'
import WhodunitGame from '../components/WhodunitGame'
import { BackLink, NotFound, PrevNextNav } from '../components/DetailPage'
import { cases, type Case } from '../lib/cases'
import { findWithNeighbors } from '../lib/neighbors'

const BACK = '← Vakalara dön'
const linkTo = (c: Case) => ({ to: `/vakalar/${c.id}`, label: `Fall ${c.nr}` })

function CaseDetail() {
  const { id } = useParams()
  const found = findWithNeighbors(cases, id)
  if (!found) return <NotFound back="/vakalar" backLabel={BACK} message="Bu vaka dosyası bulunamadı. 🔍" />

  const { item: caseItem, prev, next } = found
  const lessonLinks = caseItem.dersLinks ?? (caseItem.dersLink ? [caseItem.dersLink] : [])
  return (
    <article className="max-w-2xl">
      <BackLink to="/vakalar">{BACK}</BackLink>

      <div className="relative mt-2 overflow-hidden rounded-xl">
        <CaseScene motif={caseItem.motif} className="block w-full" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-xs font-bold text-brand-400">
            Fall {caseItem.nr}
          </span>
        </div>
      </div>

      <h1 className="mt-4 text-3xl font-bold">{caseItem.title}</h1>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-700">
        {caseItem.grammar}
      </p>
      <p className="mt-3 text-gray-700">{caseItem.tatort}</p>

      <h2 className="mt-8 text-2xl font-semibold">Olay dosyası</h2>
      {(Array.isArray(caseItem.erklaerung.tr)
        ? caseItem.erklaerung.tr
        : [caseItem.erklaerung.tr]
      ).map((absatz, i) => (
        <p key={i} className={i === 0 ? 'mt-2 text-gray-700' : 'mt-3 text-gray-700'}>
          {absatz}
        </p>
      ))}
      <De>{caseItem.erklaerung.de}</De>

      <div className="mt-6 rounded-lg bg-gray-900/95 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-400">
          🔍 Indizien — delil notu
        </p>
        <ul className="mt-2 space-y-1.5">
          {caseItem.indizien.map((ip) => (
            <li key={ip} className="text-sm text-gray-100">
              <span className="mr-1.5 text-brand-400">›</span>
              {ip}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-8 text-2xl font-semibold">Örnekler</h2>
      <ul className="mt-3 space-y-2">
        {caseItem.sentences.map((s) => (
          <li
            key={s.de}
            className="rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm"
          >
            <span className="italic text-gray-800">
              {s.de}
              <SpeakButton text={s.de} />
            </span>
            <span className="block text-gray-500">{s.tr}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-brand-300 bg-brand-50 px-4 py-3">
        <Mascot mood="teach" className="mt-0.5 w-10 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-800">Merke — aklında tut</p>
          <p className="mt-0.5 text-sm text-gray-700">{caseItem.merke}</p>
        </div>
      </div>

      {lessonLinks.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <span>Teoriyi derinleştir:</span>
          <span className="ml-1 inline-flex flex-wrap gap-x-3 gap-y-1">
            {lessonLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-brand-600 hover:underline">
                {l.label} →
              </Link>
            ))}
          </span>
        </div>
      )}

      {caseItem.whodunit && <WhodunitGame data={caseItem.whodunit} />}

      {caseItem.quiz && (
        <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50/40 p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">
            🕵️ Davayı çöz — mini quiz
          </p>
          <FillBlankQuiz
            embedded
            def={inlineQuiz(`vaka-${caseItem.id}`, 'Doğru dilbilgisiyle davayı kapat', caseItem.quiz)}
          />
        </div>
      )}

      <PrevNextNav prev={prev && linkTo(prev)} next={next && linkTo(next)} />
    </article>
  )
}

export default CaseDetail
