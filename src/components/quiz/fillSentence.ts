// Fills one or more "___" blanks in order. With a single blank `correct` is inserted
// directly; with two, `correct` (and the `wrong` options) are written as
// "part1 … part2" — each part goes into its own "___" in order (see
// zweiteiligeKonnektoren.json, imperativ.json).
export function fillSentence(sentence: string, correct: string): string {
  const parts = correct.split(' … ')
  let i = 0
  return sentence.replace(/___/g, () => parts[Math.min(i++, parts.length - 1)])
}
