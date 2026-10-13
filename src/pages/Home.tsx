import { Link } from 'react-router'
import Mascot from '../components/Mascot'
import ReviewReminder from '../components/ReviewReminder'
import config from '../config'
import { fromLang, localize } from '../i18n'
// Study techniques do not depend on the taught language, so they live in shared data, not
// in config; their English text sits next to the Turkish (`titleEn`…, see localize).
import techniquesData from '#shared/ogrenmeTeknikleri.json'

const techniques = localize(techniquesData, fromLang)

function Home() {
  const { title, intro, ctas } = config.home
  return (
    <>
      <section className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
        <Mascot mood="happy" className="w-36 shrink-0 sm:w-44" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-gray-600">{intro}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            {ctas.map((cta) => (
              <Link
                key={cta.to}
                to={cta.to}
                className={
                  cta.primary
                    ? 'rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700'
                    : 'rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-50'
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ReviewReminder />

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">{techniques.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{techniques.intro}</p>
        {/* Neutral cards: the brand accent is reserved for things you can act on
            (links, buttons, active nav), so it still means something there. */}
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {techniques.items.map((t) => (
            <li key={t.title} className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">{t.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{t.body}</p>
              {t.ref && <p className="mt-2.5 text-xs text-gray-400">{t.ref}</p>}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Home
