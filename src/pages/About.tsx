import Mascot from '../components/Mascot'
import config from '../config'
import { t } from '../i18n'

function About() {
  const { intro, siblings } = config.about

  return (
    <section className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
      <Mascot mood="wave" className="w-36 shrink-0 sm:w-44" />
      <div>
        <h1 className="text-3xl font-bold">{t.about.title}</h1>
        <p className="mt-3 text-gray-600">{intro}</p>
        <p className="mt-3 text-gray-600">{t.about.felix}</p>
        {/* A target may have no sibling links at all; render nothing rather than an
            empty, still-spaced row. */}
        <div
          className={
            siblings.length > 0
              ? 'mt-5 flex flex-wrap justify-center gap-3 sm:justify-start'
              : 'hidden'
          }
        >
          {siblings.map((sibling) => (
            <a
              key={sibling.url}
              href={sibling.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              {sibling.label} →
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
