// Estimated study time for a lesson, in minutes. Counts the words of every text in
// the blocks (explanation, translation, example, note); `component` blocks draw their
// content from a file under sources/, so that data is counted too — otherwise the
// table-heavy, densest lessons would look like the shortest ones. Each quiz attached
// to the lesson adds time on top. Based on a learner's pace (~140 words/min), the same
// way articles estimate "reading time".
//
// Deliberately free of imports: the lesson-meta Vite plugin (vite/lessonMeta.ts) runs
// this at build time in Node, so the lessons list shows every lesson's time without
// downloading every lesson. The browser only calls it for documents it already holds
// (the speaking lessons).
function countWords(node: unknown): number {
  if (typeof node === 'string') {
    const t = node.trim()
    return t ? t.split(/\s+/).length : 0
  }
  if (Array.isArray(node)) return node.reduce<number>((s, n) => s + countWords(n), 0)
  if (node && typeof node === 'object') {
    return Object.values(node as Record<string, unknown>).reduce<number>(
      (s, n) => s + countWords(n),
      0,
    )
  }
  return 0
}

type SourceRef = { source?: string; group?: string }
type Block = {
  type?: string
  name?: string
  props?: SourceRef & { boxes?: SourceRef[] }
  minutes?: number
}

export type MinutesContext = {
  /** A source file's content by name; undefined when unknown. */
  source?: (name: string) => Record<string, unknown> | undefined
  /**
   * A component that takes `source` without a `group` falls back to a fixed group of its
   * own; that default is declared next to the component
   * (components/lessons/defaultGroups.ts). Reading the whole file instead would count what the page
   * never renders — `satzbau` (Sprachberg's data) and `quiz`, which MINUTES_PER_QUIZ
   * already pays for — and would count it once per block sharing the source.
   */
  defaultGroups?: Record<string, string>
  /** Quizzes shown under the lesson. */
  quizCount?: number
}

// The data feeding a `component` block, if any — the body of its tables and card lists.
// `boxes` covers the components that pull several groups side by side (TableCards).
function componentWords(block: Block, ctx: MinutesContext): number {
  const props = block.props ?? {}
  const refs = props.boxes?.length ? props.boxes : [props]
  return refs.reduce((sum, ref) => {
    const doc = ref.source ? ctx.source?.(ref.source) : undefined
    const group = ref.group ?? ctx.defaultGroups?.[block.name ?? '']
    return sum + (doc && group ? countWords(doc[group]) : 0)
  }, 0)
}

const MINUTES_PER_QUIZ = 3
// If a video block does not declare its own length (props.minutes), watch time never
// reaches the word count — a rough default keeps the estimate from ignoring the video.
const DEFAULT_VIDEO_MINUTES = 5

export function estimateMinutes(doc: { blocks: unknown[] }, ctx: MinutesContext = {}): number {
  const blocks = doc.blocks as Block[]
  const words =
    countWords(doc.blocks) +
    blocks.reduce((sum, b) => sum + (b?.type === 'component' ? componentWords(b, ctx) : 0), 0)
  const videoMinutes = blocks.reduce(
    (sum, b) => sum + (b?.type === 'video' ? (b.minutes ?? DEFAULT_VIDEO_MINUTES) : 0),
    0,
  )
  const quizMinutes = (ctx.quizCount ?? 0) * MINUTES_PER_QUIZ
  return Math.max(3, Math.round(words / 140) + quizMinutes + videoMinutes)
}
