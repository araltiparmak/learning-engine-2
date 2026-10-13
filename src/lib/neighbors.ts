/** The item of `items` whose id is `id`, with the items before and after it in the list. */
export function findWithNeighbors<T extends { id: string }>(
  items: readonly T[],
  id: string | undefined,
): { item: T; prev?: T; next?: T } | undefined {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return undefined
  return { item: items[index], prev: items[index - 1], next: items[index + 1] }
}
