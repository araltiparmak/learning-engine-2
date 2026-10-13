import { useState } from 'react'
import { getCookieSet, setCookieSetEntry, toggleCookieSetEntry } from './cookies'

// Favourited TABLE/CARD blocks. Each favourite is a reference to a lesson block:
// "<slug>#<block-id>" (the id is permanent in the lesson JSON, so favourites do not
// shift when block order changes — NEVER use the index). This keeps the cookie small
// and lets the Favourites tab re-render the block as-is.
const COOKIE = 'favoriten'

// Saved feed cards share the cookie: "feed/<track>/<topic-id>:<card-hash>" (lib/feed.ts).
// They carry no "#", so they never parse as a lesson block reference.
export const FEED_CARD_PREFIX = 'feed/'
export const isFeedCardId = (id: string) => id.startsWith(FEED_CARD_PREFIX)

export function getFavoriteIds(): string[] {
  return [...getCookieSet(COOKIE)]
}

export function isFavoriteBlock(id: string): boolean {
  return getCookieSet(COOKIE).has(id)
}

// Adds or removes; returns the resulting state.
export function toggleFavoriteBlock(id: string): boolean {
  return toggleCookieSetEntry(COOKIE, id)
}

export function removeFavoriteBlock(id: string) {
  setCookieSetEntry(COOKIE, id, false)
}

// Favourited LESSONS. Deliberately a second cookie: `favoriten` holds block/row
// references ("<slug>#<block-id>[:<row-hash>]") that the notes page parses and re-renders,
// so a bare lesson slug in there would be read as a broken block reference.
const LESSON_COOKIE = 'favoriLektionen'

export function getFavoriteLessons(): Set<string> {
  return getCookieSet(LESSON_COOKIE)
}

// Adds or removes; returns the resulting state.
export function toggleFavoriteLesson(slug: string): boolean {
  return toggleCookieSetEntry(LESSON_COOKIE, slug)
}

/** The favourite lessons as page state, re-read from the cookie after every toggle. */
export function useFavoriteLessons() {
  const [favorites, setFavorites] = useState(getFavoriteLessons)
  const toggleFavorite = (slug: string) => {
    toggleFavoriteLesson(slug)
    setFavorites(getFavoriteLessons())
  }
  return { favorites, toggleFavorite }
}
