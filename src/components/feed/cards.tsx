import SpeakButton from '../SpeakButton'
import { inline } from '../inline'
import type {
  Card,
  ExampleCard,
  MistakeCard,
  QuizCard,
  RecapCard,
  RuleCard,
  SayCard,
  Topic,
} from '../../lib/feed'
import { t } from '../../i18n'

// The content of feed cards that read the same in the feed and on /notlar. Interactive
// cards (quiz, say) are interactive only in the feed; here they have a solved form.

export const filled = (q: QuizCard) => q.q.replace('___', q.correct)

// Chip colours per card type. Quiz and say ask something of the reader, so they get the
// solid accent; mistake keeps the fixed "wrong" red; the rest stay in the theme's scales.
const kindTone: Record<Card['type'], string> = {
  hook: 'bg-gray-100 text-gray-600',
  rule: 'bg-brand-100 text-brand-800',
  example: 'bg-accent-100 text-accent-700',
  mistake: 'bg-red-50 text-red-700',
  say: 'bg-brand-600 text-white',
  quiz: 'bg-brand-600 text-white',
  recap: 'border border-brand-300 bg-white text-brand-700',
  outro: 'bg-gray-100 text-gray-600',
}

// What kind of card this is (Rule, Example, Quiz…), shown at the top of every card.
export function KindLabel({ type, className = '' }: { type: Card['type']; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${kindTone[type]} ${className}`}
    >
      {t.feed.kinds[type]}
    </span>
  )
}

export function RuleBody({ card }: { card: RuleCard }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{card.title}</h2>
      <p className="mt-3 text-lg leading-relaxed text-gray-700">{inline(card.text)}</p>
      {card.de && (
        <ul className="mt-6 space-y-2">
          {card.de.map((de) => (
            <li
              key={de}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-lg text-brand-900"
            >
              {de}
              <SpeakButton text={de} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ExampleBody({ card }: { card: ExampleCard }) {
  return (
    <div className="text-center">
      <p className="text-2xl leading-snug font-semibold text-brand-900">
        {card.de}
        <SpeakButton text={card.de} />
      </p>
      <p className="mt-4 text-gray-600">{card.tr}</p>
    </div>
  )
}

export function MistakeBody({ card }: { card: MistakeCard }) {
  return (
    <div>
      <p className="text-xl text-gray-500">
        <span className="mr-2 font-bold text-red-600" aria-hidden>
          ✗
        </span>
        <span className="line-through decoration-red-400">{card.wrong}</span>
      </p>
      <p className="mt-3 text-2xl leading-snug font-semibold text-brand-900">
        <span className="mr-2 text-green-600" aria-hidden>
          ✓
        </span>
        {card.right}
        <SpeakButton text={card.right} />
      </p>
      {card.tr && <p className="mt-1 text-gray-500">{card.tr}</p>}
      <p className="mt-6 text-lg leading-relaxed text-gray-700">{inline(card.why)}</p>
    </div>
  )
}

export function RecapBody({ card, topic }: { card: RecapCard; topic: Topic }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{topic.title}</h2>
      <ul className="mt-5 space-y-1.5">
        {card.points.map((point) => (
          <li
            key={point}
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-base text-gray-800"
          >
            {inline(point)}
          </li>
        ))}
      </ul>
    </div>
  )
}

// A quiz card as a worked answer: the sentence with the right word in place.
function SolvedQuiz({ card }: { card: QuizCard }) {
  return (
    <div>
      {card.context && <p className="mb-2 text-gray-600">{card.context}</p>}
      <p className="text-xl font-semibold text-brand-900">
        {filled(card)}
        <SpeakButton text={filled(card)} />
      </p>
      {card.tr && <p className="mt-1 text-gray-500">{card.tr}</p>}
      {card.reason && <p className="mt-3 text-gray-700">{card.reason}</p>}
    </div>
  )
}

function SolvedSay({ card }: { card: SayCard }) {
  return (
    <div>
      <p className="text-gray-600">{card.tr}</p>
      <p className="mt-2 text-xl font-semibold text-brand-900">
        {card.de}
        <SpeakButton text={card.de} />
      </p>
      {card.note && <p className="mt-2 text-gray-600">{card.note}</p>}
    </div>
  )
}

// One saved card on /notlar, under the same type label it has in the feed.
export function SavedCardBody({ card, topic }: { card: Card; topic: Topic }) {
  const body = savedBody(card, topic)
  return (
    body && (
      <>
        <KindLabel type={card.type} className="mb-3" />
        {body}
      </>
    )
  )
}

function savedBody(card: Card, topic: Topic) {
  switch (card.type) {
    case 'rule':
      return <RuleBody card={card} />
    case 'example':
      return <ExampleBody card={card} />
    case 'mistake':
      return <MistakeBody card={card} />
    case 'recap':
      return <RecapBody card={card} topic={topic} />
    case 'quiz':
      return <SolvedQuiz card={card} />
    case 'say':
      return <SolvedSay card={card} />
    default:
      return null
  }
}
