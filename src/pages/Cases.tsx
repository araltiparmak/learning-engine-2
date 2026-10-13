import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import CaseScene from '../components/CaseScene'
import { cases, casesIntro } from '../lib/cases'

function Cases() {
  return (
    <section>
      <div className="flex items-start gap-3">
        <Mascot mood="teach" className="w-14 shrink-0" />
        <div>
          <h2 className="text-2xl font-bold">
            Vakalar <span className="align-middle text-xl">🕵️</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">{casesIntro}</p>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cases.map((caseItem) => (
          <li key={caseItem.id}>
            <Link
              to={`/vakalar/${caseItem.id}`}
              className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-brand-400 hover:shadow-md"
            >
              <div className="relative">
                <CaseScene motif={caseItem.motif} className="block w-full" />
                <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-2 py-0.5 text-xs font-bold text-brand-400">
                  Fall {caseItem.nr}
                </span>
                <span className="absolute right-3 top-3 flex gap-1.5">
                  {!!caseItem.whodunit && (
                    <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-xs font-medium text-brand-200">
                      🎮 Sen çöz
                    </span>
                  )}
                  {caseItem.quiz && caseItem.quiz.length > 0 && (
                    <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-xs font-medium text-brand-200">
                      ✍️ {caseItem.quiz.length}
                    </span>
                  )}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold group-hover:text-brand-700">
                  {caseItem.title}
                </h2>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-brand-700">
                  {caseItem.grammar}
                </p>
                <p className="mt-2 text-sm text-gray-600">{caseItem.tatort}</p>
                <span className="mt-3 inline-block text-sm font-medium text-brand-600">
                  Dosyayı aç →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Cases
