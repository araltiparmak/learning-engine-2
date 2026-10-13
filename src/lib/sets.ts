/** A copy of `set` with `item` added (`on`) or removed; flips it when `on` is omitted. */
export function toggled<T>(set: ReadonlySet<T>, item: T, on = !set.has(item)): Set<T> {
  const next = new Set(set)
  if (on) next.add(item)
  else next.delete(item)
  return next
}
