import { useState } from 'react'
import { toggled } from './sets'

// Tracks which items are expanded in "reveal the answer" lists.
export function useRevealed() {
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set())
  const toggle = (i: number) => setRevealed((prev) => toggled(prev, i))
  return { isRevealed: (i: number) => revealed.has(i), toggle }
}
