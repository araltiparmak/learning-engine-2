// One promise per key for the whole session, ready for React's use(). The promise is
// marked fulfilled the moment it resolves — use() reads that mark first, so content that
// has already arrived renders straight away instead of flashing the loading fallback.
// A failed load is forgotten, so the next render tries again.
type Tracked<T> = Promise<T> & { status?: 'fulfilled'; value?: T }

const cache = new Map<string, Promise<unknown>>()

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as Tracked<T> | undefined
  if (hit) return hit
  const promise: Tracked<T> = load()
  promise.then(
    (value) => {
      promise.status = 'fulfilled'
      promise.value = value
    },
    () => cache.delete(key),
  )
  cache.set(key, promise)
  return promise
}
