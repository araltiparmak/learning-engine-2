import data from '#content/pages/games.json'
import { gloss } from '../i18n'
import { getCookieSet, setCookieSet } from './cookies'
import type { Level } from '../config/types'

// Word games (/oyunlar): a set is one word group (days, months, numbers…) and the games
// played with it. Every game reads the set's `items`; a game only adds what it needs on
// top (match: which two fields to pair, sort: the boxes, fill: its own sentences).

export type GameItem = {
  id: string
  de: string
  tr: string
  en?: string
  /** A short written form (Mo, Di… / Jan, Feb…), paired in a match game. */
  short?: string
  /** The sort-game box this item belongs in (a bucket id). */
  group?: string
  /** What the speak button reads when `de` alone is not what should be heard. */
  speak?: string
}

/** Which side of an item a match game shows: `meaning` is the reader's language (gloss). */
export type ItemField = 'de' | 'short' | 'meaning'

type GameBase = { id: string; title: string; intro?: string }

export type MatchGame = GameBase & {
  type: 'match'
  left: ItemField
  right: ItemField
  /** Items per round, picked at random; all of them when omitted. */
  count?: number
}
export type OrderGame = GameBase & { type: 'order'; count?: number }
export type SortGame = GameBase & {
  type: 'sort'
  buckets: { id: string; de: string; tr: string; en?: string }[]
}
export type FillQuestion = {
  sentence: string
  correct: string
  wrong: string[]
  tr?: string
}
export type FillGame = GameBase & { type: 'fill'; questions: FillQuestion[]; count?: number }

export type Game = MatchGame | OrderGame | SortGame | FillGame

export type GameSet = {
  id: string
  title: string
  de: string
  level: Level
  emoji?: string
  intro?: string
  items: GameItem[]
  games: Game[]
}

export const gameSets = data.sets as GameSet[]

export function itemText(item: GameItem, field: ItemField): string {
  if (field === 'meaning') return gloss(item) ?? item.tr
  if (field === 'short') return item.short ?? item.de
  return item.de
}

// Best star count per game, kept as "<set>/<game>:<stars>" entries in one cookie.
const STARS_COOKIE = 'oyunYildiz'
export const MAX_STARS = 3

/** No mistakes: 3 stars · up to 2 mistakes: 2 · otherwise 1. */
export function starsFor(mistakes: number): number {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
}

export const gameKey = (setId: string, gameId: string) => `${setId}/${gameId}`

function readStars(): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of getCookieSet(STARS_COOKIE)) {
    const i = entry.lastIndexOf(':')
    map.set(entry.slice(0, i), Number(entry.slice(i + 1)) || 0)
  }
  return map
}

export function bestStars(key: string): number {
  return readStars().get(key) ?? 0
}

/** Stars earned across a set's games (best of each). */
export function setStars(set: GameSet): number {
  const map = readStars()
  return set.games.reduce((sum, g) => sum + (map.get(gameKey(set.id, g.id)) ?? 0), 0)
}

/** Keeps the better of the stored and the new count; returns the count stored before. */
export function saveStars(key: string, stars: number): number {
  const map = readStars()
  const before = map.get(key) ?? 0
  if (stars > before) {
    map.set(key, stars)
    setCookieSet(STARS_COOKIE, new Set([...map].map(([k, n]) => `${k}:${n}`)))
  }
  return before
}
