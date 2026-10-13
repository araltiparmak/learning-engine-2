import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import Mascot from '../components/Mascot'
import SpeakButton from '../components/SpeakButton'
import { inline } from '../components/inline'
import { NoteButton } from '../components/rowFavorites'
import {
  ExampleBody,
  KindLabel,
  MistakeBody,
  RecapBody,
  RuleBody,
  filled,
} from '../components/feed/cards'
import {
  markTopicDone,
  savedCardId,
  tracks,
  type Card,
  type QuizCard,
  type SayCard,
  type Topic,
  type Track,
  type TrackConfig,
} from '../lib/feed'
import { shuffle } from '../lib/shuffle'
import { language } from '../lib/language'
import { t } from '../i18n'

// A reels-style feed for one topic: full-screen cards that snap one at a time
// (hook → rules with examples, mistakes and quick checks → recap → outro). A wrongly answered check comes back a
// few cards later, and once the topic's cards run out its checks keep coming back in
// mixed rounds, so the scroll never hits a wall.

type Item =
  | { kind: 'intro'; key: string }
  | { kind: 'mix'; key: string; round: number }
  | {
      kind: 'card'
      key: string
      card: Card
      position: number // 1-based index inside the topic, for the "3/10" counter
      retry?: boolean
      mixed?: boolean
    }

// How many cards later a wrongly answered check reappears.
const RETRY_GAP = 5
// Checks per mixed round once the topic's cards run out.
const MIX_SIZE = 6

const topicItems = (topic: Topic): Item[] => [
  { kind: 'intro', key: 'intro' },
  ...topic.cards.map((card, i): Item => ({ kind: 'card', key: `c${i}`, card, position: i + 1 })),
]

function mixBatch(topic: Topic, round: number): Item[] {
  const pool = topic.cards.flatMap((card, i) =>
    card.type === 'quiz' ? [{ card, position: i + 1 }] : [],
  )
  return [
    { kind: 'mix', key: `mix-${round}`, round },
    ...shuffle(pool)
      .slice(0, MIX_SIZE)
      .map((p, i): Item => ({ kind: 'card', key: `mix-${round}-${i}`, ...p, mixed: true })),
  ]
}

function Feed({ track = 'grammar' }: { track?: Track }) {
  const { id } = useParams()
  const feed = tracks[track]
  const topic = feed.topics.find((tp) => tp.id === id)
  if (!topic) return <Navigate to={feed.home} replace />
  // Keyed so that moving to the next topic starts a fresh feed instead of reusing state.
  return <TopicFeed key={topic.id} topic={topic} feed={feed} />
}

function TopicFeed({ topic, feed }: { topic: Topic; feed: TrackConfig }) {
  const [items, setItems] = useState(() => topicItems(topic))
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const next = feed.topics[feed.topics.indexOf(topic) + 1]

  // Focus the scroller so arrow keys / space page through the cards on desktop.
  useEffect(() => scroller.current?.focus({ preventScroll: true }), [])

  // Every card is exactly one scroller-height tall, so the active index is a division.
  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    setActive(Math.round(el.scrollTop / el.clientHeight))
  }

  useEffect(() => {
    const item = items[active]
    if (item?.kind === 'card' && item.card.type === 'outro' && !item.mixed) markTopicDone(topic.id)
    // Keep a couple of cards ahead of the reader so the feed never ends.
    // Re-checked against the latest state, so StrictMode's double effect appends only once.
    if (active >= items.length - 2)
      setItems((prev) =>
        active >= prev.length - 2
          ? [...prev, ...mixBatch(topic, prev.filter((it) => it.kind === 'mix').length + 1)]
          : prev,
      )
  }, [active, items, topic])

  const onWrong = useCallback((key: string) => {
    setItems((prev) => {
      const at = prev.findIndex((it) => it.key === key)
      const item = prev[at]
      if (item?.kind !== 'card' || item.retry) return prev
      const copy: Item = { ...item, key: `${key}-retry`, retry: true }
      if (prev.some((it) => it.key === copy.key)) return prev
      const result = [...prev]
      result.splice(Math.min(at + RETRY_GAP, result.length), 0, copy)
      return result
    })
  }, [])

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      tabIndex={-1}
      className="fixed inset-x-0 top-14 bottom-0 z-30 snap-y snap-mandatory overflow-y-auto overscroll-contain bg-gray-50 outline-none"
    >
      {items.map((item) => (
        <section key={item.key} className="h-full snap-start snap-always">
          {item.kind === 'intro' ? (
            <IntroCard topic={topic} feed={feed} />
          ) : item.kind === 'mix' ? (
            <MixCard first={item.round === 1} next={next} feed={feed} />
          ) : (
            <TopicCard topic={topic} feed={feed} item={item} onWrong={onWrong} />
          )}
        </section>
      ))}
    </div>
  )
}

function Frame({ tone = 'bg-white', children }: { tone?: string; children: ReactNode }) {
  return (
    <div className={`flex h-full items-center justify-center px-4 ${tone}`}>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

function ScrollHint() {
  return (
    <p className="mt-10 animate-bounce text-center text-sm text-gray-400" aria-hidden>
      {t.feed.scrollHint} ↓
    </p>
  )
}

const pill =
  'inline-block rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100'

function IntroCard({ topic, feed }: { topic: Topic; feed: TrackConfig }) {
  return (
    <Frame tone="bg-brand-50">
      <Link to={feed.home} className="text-sm text-gray-500 hover:text-gray-800">
        {t.feed.allTopics}
      </Link>
      <div className="mt-6 text-center">
        {topic.emoji && <p className="text-5xl">{topic.emoji}</p>}
        <h1 className="mt-4 text-3xl font-bold">{topic.title}</h1>
        {topic.description && <p className="mt-3 text-gray-600">{topic.description}</p>}
        <p className="mt-3 text-sm text-gray-500">
          {topic.level} · {t.feed.cardCount(topic.cards.length)}
        </p>
      </div>
      <ScrollHint />
    </Frame>
  )
}

function MixCard({ first, next, feed }: { first: boolean; next?: Topic; feed: TrackConfig }) {
  return (
    <Frame tone="bg-brand-50">
      <div className="text-center">
        <Mascot mood={first ? 'celebrate' : 'study'} className="mx-auto w-20" />
        <h2 className="mt-4 text-2xl font-bold">{first ? t.feed.topicDone : t.feed.mixTitle}</h2>
        <p className="mt-3 text-gray-600">{t.feed.mixText}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {next && (
            <Link to={`${feed.path}/${next.id}`} className={pill}>
              {t.feed.nextTopic(next.title)}
            </Link>
          )}
          <Link to={feed.home} className={pill}>
            {t.feed.allTopics}
          </Link>
        </div>
      </div>
      <ScrollHint />
    </Frame>
  )
}

function TopicCard({
  topic,
  feed,
  item,
  onWrong,
}: {
  topic: Topic
  feed: TrackConfig
  item: Extract<Item, { kind: 'card' }>
  onWrong: (key: string) => void
}) {
  const { card } = item
  const tone =
    card.type === 'hook' || card.type === 'outro' || card.type === 'recap'
      ? 'bg-brand-50'
      : card.type === 'quiz'
        ? 'bg-gray-50'
        : 'bg-white'
  const saveId = savedCardId(feed.id, topic.id, card)

  return (
    <Frame tone={tone}>
      <div className="mb-6 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span className="truncate">
          {topic.emoji} {topic.title}
        </span>
        <span className="flex shrink-0 items-center">
          {item.retry ? t.feed.retryBadge : item.mixed ? t.feed.mixBadge : t.feed.progress(item.position, topic.cards.length)}
          {saveId && <NoteButton id={saveId} inline className="-my-2 p-2" />}
        </span>
      </div>
      {!item.retry && !item.mixed && (
        <div className="mb-8 h-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-brand-500"
            style={{ width: `${(item.position / topic.cards.length) * 100}%` }}
          />
        </div>
      )}
      <KindLabel type={card.type} className="mb-5" />
      <CardBody topic={topic} feed={feed} item={item} onWrong={onWrong} />
    </Frame>
  )
}

function CardBody({
  topic,
  feed,
  item,
  onWrong,
}: {
  topic: Topic
  feed: TrackConfig
  item: Extract<Item, { kind: 'card' }>
  onWrong: (key: string) => void
}) {
  const { card } = item
  switch (card.type) {
    case 'hook':
      return (
        <div className="text-center">
          <Mascot mood="teach" className="mx-auto w-20" />
          <p className="mt-5 text-2xl leading-snug font-semibold">{inline(card.text)}</p>
          {card.de && (
            <p className="mt-6 text-lg text-brand-800 italic">
              {card.de}
              <SpeakButton text={card.de} />
            </p>
          )}
        </div>
      )
    case 'rule':
      return <RuleBody card={card} />
    case 'example':
      return <ExampleBody card={card} />
    case 'mistake':
      return <MistakeBody card={card} />
    case 'recap':
      return <RecapBody card={card} topic={topic} />
    case 'say':
      return <SayBody card={card} />
    case 'quiz':
      return <QuizBody card={card} onWrong={() => onWrong(item.key)} retry={item.retry} />
    case 'outro':
      return (
        <div className="text-center">
          <Mascot mood="celebrate" className="mx-auto w-20" />
          <p className="mt-5 text-lg leading-relaxed">{inline(card.text)}</p>
          {topic.lesson && (
            <Link to={`${feed.lessonPath}/${topic.lesson}`} className={`mt-6 ${pill}`}>
              {t.feed.fullLesson}
            </Link>
          )}
          <ScrollHint />
        </div>
      )
  }
}

function QuizBody({
  card,
  onWrong,
  retry,
}: {
  card: QuizCard
  onWrong: () => void
  retry?: boolean
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const answered = picked !== null
  const right = picked === card.correct
  const [before, after] = card.q.split('___')

  const pick = (option: string) => {
    if (answered) return
    setPicked(option)
    if (option !== card.correct) onWrong()
  }

  return (
    <div>
      {card.context && <p className="mb-4 text-center text-gray-600">{card.context}</p>}
      <p className="text-center text-2xl leading-snug font-semibold">
        {before}
        <span
          className={`mx-1 inline-block min-w-16 border-b-2 px-1 ${
            // The blank always shows the right answer; the buttons below show what was picked.
            answered ? 'border-green-500 text-green-700' : 'border-gray-400'
          }`}
        >
          {answered ? card.correct : ' '}
        </span>
        {after}
        {answered && <SpeakButton text={filled(card)} />}
      </p>
      {answered && card.tr && <p className="mt-2 text-center text-gray-500">{card.tr}</p>}

      <div className="mt-8 grid gap-3">
        {card.options.map((option) => {
          const state = !answered
            ? 'border-gray-300 bg-white hover:border-brand-400'
            : option === card.correct
              ? 'border-green-500 bg-green-50 text-green-800'
              : option === picked
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-400'
          return (
            <button
              key={option}
              onClick={() => pick(option)}
              disabled={answered}
              className={`rounded-xl border-2 px-4 py-3.5 text-lg font-medium transition ${state}`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-6 text-center">
          <p className={`font-semibold ${right ? 'text-green-700' : 'text-red-600'}`}>
            {right ? t.feed.correct : t.feed.wrong}
          </p>
          {card.reason && <p className="mt-1 text-gray-700">{card.reason}</p>}
          {!right && !retry && <p className="mt-2 text-sm text-gray-500">{t.feed.retryNote}</p>}
        </div>
      )}
    </div>
  )
}

function SayBody({ card }: { card: SayCard }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="text-center">
      <p className="text-sm font-medium tracking-wide text-brand-700">{language.sayPrompt}</p>
      <p className="mt-3 text-2xl leading-snug font-semibold">{card.tr}</p>
      {shown ? (
        <div className="mt-8">
          <p className="text-2xl leading-snug font-semibold text-brand-900">
            {card.de}
            <SpeakButton text={card.de} />
          </p>
          {card.note && <p className="mt-3 text-gray-600">{card.note}</p>}
        </div>
      ) : (
        <button onClick={() => setShown(true)} className={`mt-8 ${pill}`}>
          {t.feed.sayReveal}
        </button>
      )}
    </div>
  )
}

export default Feed
