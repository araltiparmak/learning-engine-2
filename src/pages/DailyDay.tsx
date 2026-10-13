import { Suspense, use, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import LessonRenderer from '../components/LessonRenderer'
import { inline } from '../components/inline'
import LessonQuizzes from '../components/quiz/LessonQuizzes'
import QuizView from '../components/quiz/QuizView'
import { quizzesForLesson } from '../data/quizzes'
import LessonReview from '../components/LessonReview'
import ReadingTextView from '../components/ReadingTextView'
import ListeningTestView from '../components/ListeningTestView'
import { NotFound } from '../components/DetailPage'
import WritingCheck from '../components/WritingCheck'
import { hasLesson, lessonMinutes, loadLesson } from '../data/lessons'
import { type Day, type WritingTask, dayNumber, days, doneDays, nextDay, setDayDone } from '../lib/dailyPlan'
import { readingTexts } from '../lib/reading'
import { listeningTests } from '../lib/listening'
import { t, felixAvailable } from '../i18n'

// One day of the daily plan, top to bottom on one page: the pattern lesson with its
// quizzes, a reading text, a listening test, a writing task, and the "finished" button.
// The parts are the same components their own pages use; a part whose id is missing or
// unknown is simply left out.
function DailyDay() {
  const { id } = useParams()
  const day = days.find((d) => d.id === id)
  if (!day) return <NotFound back="/gunluk" backLabel={t.daily.back} message={t.daily.notFound} />
  // Keyed so that moving to the next day starts its parts (revealed answers, toggles) fresh.
  return <DayView key={day.id} day={day} />
}

function DayView({ day }: { day: Day }) {
  const reading = readingTexts.find((r) => r.id === day.reading)
  const listening = listeningTests.find((l) => l.id === day.listening)
  const lesson = hasLesson(day.lesson) ? day.lesson : undefined

  const steps: { id: string; label: string; body: ReactNode }[] = [
    ...(lesson
      ? [
          {
            id: 'kalip',
            label: t.daily.steps.pattern,
            body: (
              <Suspense fallback={<p className="mt-4 text-sm text-gray-500">{t.daily.loading}</p>}>
                <DayLesson slug={lesson} />
              </Suspense>
            ),
          },
        ]
      : []),
    ...(reading
      ? [
          {
            id: 'okuma',
            label: t.daily.steps.reading,
            body: (
              <>
                <PartTitle emoji={reading.emoji} title={reading.title} sub={reading.titleTr} />
                <ReadingTextView text={reading} />
              </>
            ),
          },
        ]
      : []),
    ...(listening
      ? [
          {
            id: 'dinleme',
            label: t.daily.steps.listening,
            body: (
              <>
                <PartTitle emoji={listening.emoji} title={listening.title} sub={listening.titleTr} />
                <ListeningTestView test={listening} />
              </>
            ),
          },
        ]
      : []),
    ...(day.writing
      ? [
          {
            id: 'yazma',
            label: t.daily.steps.writing,
            body: <DayWriting writing={day.writing} topic={day.writing.topic ?? day.title} />,
          },
        ]
      : []),
  ]

  return (
    <>
      <section className="max-w-2xl">
        <Link to="/gunluk" className="text-sm text-brand-600 hover:underline">
          {t.daily.back}
        </Link>
        <p className="mt-3 text-sm font-semibold text-brand-700">
          {t.daily.dayLabel(dayNumber(day))} · {day.emoji && `${day.emoji} `}
          {day.theme} · {day.level}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight">{day.title}</h1>

        <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{t.daily.focus}</p>
          <p className="mt-1 text-sm text-gray-700">{inline(day.focus)}</p>
        </div>

        <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {steps.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-gray-700 hover:text-brand-700 hover:underline">
                <span className="mr-1 tabular-nums text-gray-400">{i + 1}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {steps.map((s, i) => (
        <section key={s.id} id={s.id} className="mt-14 max-w-2xl scroll-mt-20 border-t border-gray-200 pt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {i + 1}. {s.label}
          </p>
          {s.body}
        </section>
      ))}

      <DayFinish day={day} />
    </>
  )
}

// Questions in the day's quiz: a short round keeps the whole day near 15 minutes.
const DAY_QUIZ_COUNT = 8

// Suspends until the lesson document and the sources its blocks and quizzes read arrive.
// A lesson that marks blocks with `daily` is shown as that short version, with only its
// multiple-choice quiz and a link to the whole lesson; an unmarked lesson is shown whole.
function DayLesson({ slug }: { slug: string }) {
  const doc = use(loadLesson(slug))!
  const brief = doc.blocks.filter((b) => b.daily)
  if (brief.length === 0) {
    return (
      <>
        <LessonRenderer lesson={doc} slug={slug} showBack={false} minutes={lessonMinutes(slug)} />
        <LessonQuizzes slug={slug} />
        <LessonReview review={doc.review} />
      </>
    )
  }
  const quiz = quizzesForLesson(slug).find((q) => q.engine === 'fillBlank')
  return (
    <>
      <LessonRenderer lesson={{ ...doc, blocks: brief }} slug={slug} showBack={false} />
      {quiz && (
        <div className="mt-8 max-w-2xl rounded-xl border border-brand-200 bg-brand-50/40 p-5">
          <QuizView def={{ ...quiz, count: DAY_QUIZ_COUNT }} embedded />
        </div>
      )}
      <LessonReview review={doc.review} />
      <Link to={`/dersler/${slug}`} className="mt-4 inline-block text-sm text-brand-600 hover:underline">
        {t.daily.fullLesson}
      </Link>
    </>
  )
}

function PartTitle({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <>
      <h2 className="mt-2 text-2xl font-bold">
        <span className="mr-2">{emoji}</span>
        {title}
      </h2>
      <p className="mt-1 text-gray-500">{sub}</p>
    </>
  )
}

function DayWriting({ writing, topic }: { writing: WritingTask; topic: string }) {
  const [showModel, setShowModel] = useState(false)
  return (
    <>
      <p className="mt-3 text-gray-700">{inline(writing.task)}</p>
      <p className="mt-4 text-sm font-medium text-gray-700">{t.daily.writingUse}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700 marker:text-brand-600">
        {writing.use.map((u) => (
          <li key={u}>{inline(u)}</li>
        ))}
      </ul>

      {felixAvailable && (
        <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/40 p-5">
          <p className="mb-4 text-sm text-gray-600">{t.daily.felixIntro}</p>
          <WritingCheck topic={topic} />
        </div>
      )}

      <button
        onClick={() => setShowModel((s) => !s)}
        aria-expanded={showModel}
        className="mt-5 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition hover:border-brand-400 hover:text-brand-700"
      >
        {showModel ? t.daily.hideModel : t.daily.showModel}
      </button>
      {showModel && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs text-gray-500">{t.daily.modelNote}</p>
          {writing.model.map((line) => (
            <div key={line.de} className="mt-3">
              <p className="text-gray-800">{line.de}</p>
              {line.tr && <p className="text-sm text-gray-500">{line.tr}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function DayFinish({ day }: { day: Day }) {
  const [done, setDone] = useState(() => doneDays().has(day.id))
  const next = nextDay(day)

  const toggle = () => {
    setDayDone(day.id, !done)
    setDone(!done)
  }

  return (
    <div className="mt-14 max-w-2xl rounded-xl border border-brand-300 bg-brand-50 p-5 text-center">
      {done && <p className="font-medium text-green-700">{t.daily.marked}</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-3 first:mt-0">
        <button
          onClick={toggle}
          className={
            done
              ? 'rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-100'
              : 'rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white transition hover:bg-brand-700'
          }
        >
          {done ? t.daily.unmark : t.daily.markDone}
        </button>
        {next ? (
          <Link
            to={`/gunluk/${next.id}`}
            className="rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            {t.daily.dayLabel(dayNumber(next))}: {next.title} →
          </Link>
        ) : (
          <Link
            to="/gunluk"
            className="rounded-lg border border-brand-600 px-5 py-2 font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            {t.daily.allDays}
          </Link>
        )}
      </div>
    </div>
  )
}

export default DailyDay
