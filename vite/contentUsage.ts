import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

// What a content pack (content/<target>/) uses of the engine, as build-time flags. The
// engine keeps one registry of lesson blocks, one of quiz engines and one route table for
// every target; each entry is guarded by a flag, and a false flag lets the bundler drop
// that code — so a build carries exactly what its own content needs:
//
//   VITE_BLOCK_<name>    a `component` block names it anywhere in the pack (lessons and
//                        page data such as the speaking lessons' documents)
//   VITE_ENGINE_<key>    a quiz in quizzes.json names it as its `engine`
//   VITE_PAGE_<file>     the pack has pages/<file>.json, so the pages drawn from it exist
//
// Every name used by ANY pack gets a flag in every build (false where unused). A guard
// whose name no pack uses stays undefined and its code stays in, harmlessly.

type Usage = { blocks: Set<string>; engines: Set<string>; pages: Set<string> }

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'))

function jsonFilesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => path.join(e.parentPath, e.name))
}

function componentNames(node: unknown, found: Set<string>): void {
  if (Array.isArray(node)) node.forEach((n) => componentNames(n, found))
  else if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (obj.type === 'component' && typeof obj.name === 'string') found.add(obj.name)
    Object.values(obj).forEach((v) => componentNames(v, found))
  }
}

export function packUsage(pack: string): Usage {
  const blocks = new Set<string>()
  for (const file of jsonFilesUnder(pack)) componentNames(readJson(file), blocks)
  const quizzes = readJson(path.join(pack, 'quizzes.json')) as { engine?: string }[]
  const engines = new Set(quizzes.map((q) => q.engine ?? 'fillBlank'))
  const pagesDir = path.join(pack, 'pages')
  let pages = new Set<string>()
  try {
    pages = new Set(readdirSync(pagesDir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)))
  } catch {
    // A pack without page data is normal (the English packs).
  }
  return { blocks, engines, pages }
}

/** The `define` entries for the pack `active` among all packs under `contentRoot`. */
export function usageFlags(contentRoot: string, active: string): Record<string, string> {
  const packs = readdirSync(contentRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'shared')
    .map((e) => e.name)
  const usage = Object.fromEntries(packs.map((p) => [p, packUsage(path.join(contentRoot, p))]))
  const flags: Record<string, string> = {}
  for (const [kind, prefix] of [
    ['blocks', 'VITE_BLOCK_'],
    ['engines', 'VITE_ENGINE_'],
    ['pages', 'VITE_PAGE_'],
  ] as const) {
    for (const pack of packs) {
      for (const name of usage[pack][kind]) {
        flags[`import.meta.env.${prefix}${name}`] = String(usage[active]?.[kind].has(name) ?? false)
      }
    }
  }
  return flags
}
