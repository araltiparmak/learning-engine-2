// Components that read a fixed group of their source when the block gives no `group`
// (mirrors the defaults inside ./blocks.tsx; the components in ./lists.tsx take an explicit
// `group` and need none). The lesson-meta build plugin
// (vite/lessonMeta.ts) uses this to count the right rows for the reading-time estimate;
// keep the two in step when a default changes. Kept apart from ./index.ts because
// the plugin runs in Node and cannot import the React components registered there.
export const defaultGroups: Record<string, string> = {
  PairList: 'examples',
  RevealExercises: 'exercises',
  ModalCards: 'modals',
  EmailSamples: 'emails',
}
