// Guarded localStorage access for per-browser conveniences too large for a cookie.
// Every access is wrapped: localStorage throws outright in some privacy modes, and a
// half-written value must not take the page down with it.

/** The array stored under `key`; [] when it is missing, unreadable or not an array. */
export function readStoredList<T>(key: string): T[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(list) ? (list as T[]) : []
  } catch {
    return []
  }
}

/** Stores `list` under `key`; on full or unavailable storage it holds for this visit only. */
export function writeStoredList<T>(key: string, list: Iterable<T>) {
  try {
    localStorage.setItem(key, JSON.stringify([...list]))
  } catch {
    // Not remembered then; the page keeps working from its own state.
  }
}
