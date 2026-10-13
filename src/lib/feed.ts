import data from '#content/pages/feed.json'
import { getCookieSet, setCookieSetEntry } from './cookies'
import { hashText } from './audioHash'
import { FEED_CARD_PREFIX } from './favorites'
import type { Level } from '../config/types'

// Shared by the topic list (/akis), the feed itself (/akis/:id) and the saved cards on /notlar.

export type HookCard = { type: 'hook'; text: string; de?: string }
export type RuleCard = { type: 'rule'; title: string; text: string; de?: string[] }
export type ExampleCard = { type: 'example'; de: string; tr: string }
// A mistake Turkish speakers typically make: the wrong line crossed out, the right one with
// audio, and why it goes wrong. `tr` translates the right line.
export type MistakeCard = { type: 'mistake'; wrong: string; right: string; why: string; tr?: string }
// Speaking drill: the reader sees the Turkish line, says it aloud, then reveals the German.
export type SayCard = { type: 'say'; tr: string; de: string; note?: string }
export type QuizCard = {
  type: 'quiz'
  context?: string // situation shown above the question (speaking feeds)
  q: string
  options: string[]
  correct: string
  tr?: string
  reason?: string
}
// The topic on one card, right before the outro: every rule, one line each.
export type RecapCard = { type: 'recap'; points: string[] }
export type OutroCard = { type: 'outro'; text: string }
export type Card =
  | HookCard
  | RuleCard
  | ExampleCard
  | MistakeCard
  | SayCard
  | QuizCard
  | RecapCard
  | OutroCard

export type Topic = {
  id: string
  level: Level
  lesson?: string
  title: string
  description?: string
  emoji?: string
  cards: Card[]
}

export const feedIntro: string = data.intro
export const topics = data.topics as Topic[]
const speakingTopics = data.speaking as Topic[]

// Two feeds share one engine: grammar topics under /akis, speaking topics inside the
// speaking tab. `lessonPath` is where a topic's `lesson` slug points.
export type Track = 'grammar' | 'speaking'
export type TrackConfig = {
  id: Track
  topics: Topic[]
  path: string
  home: string
  lessonPath: string
}

export const tracks: Record<Track, TrackConfig> = {
  grammar: { id: 'grammar', topics, path: '/akis', home: '/akis', lessonPath: '/dersler' },
  speaking: {
    id: 'speaking',
    topics: speakingTopics,
    path: '/konusma/akis',
    home: '/konusma',
    lessonPath: '/konusma',
  },
}

// Ids of topics whose outro card has been reached.
const DONE_COOKIE = 'akisBitti'

export const doneTopics = () => getCookieSet(DONE_COOKIE)

export function markTopicDone(id: string) {
  setCookieSetEntry(DONE_COOKIE, id, true)
}

// Saving a card. A saved card is "feed/<track>/<topic-id>:<hash>" in the same cookie as
// saved lesson rows (lib/favorites.ts), so /notlar lists both. The hash is hashText() of
// the card's leading text: reordering cards keeps the save, rewording that text drops it —
// the same trade-off lesson rows make. Hook and outro carry nothing worth keeping.
function cardKeyText(card: Card): string | undefined {
  switch (card.type) {
    case 'rule':
      return card.title
    case 'example':
    case 'say':
      return card.de
    case 'mistake':
      return card.right
    case 'quiz':
      return card.q
    case 'recap':
      return 'recap' // one per topic
    default:
      return undefined
  }
}

export function savedCardId(track: Track, topicId: string, card: Card): string | undefined {
  const text = cardKeyText(card)
  return text === undefined ? undefined : `${FEED_CARD_PREFIX}${track}/${topicId}:${hashText(text)}`
}

// The card behind a saved id; undefined once the topic or the card's text is gone.
export function findSavedCard(id: string) {
  const match = /^feed\/(\w+)\/(.+):[0-9a-f]{8}$/.exec(id)
  if (!match) return undefined
  const feed = tracks[match[1] as Track]
  const topic = feed?.topics.find((tp) => tp.id === match[2])
  const card = topic?.cards.find((c) => savedCardId(feed.id, topic.id, c) === id)
  return card && { feed, topic: topic!, card }
}
