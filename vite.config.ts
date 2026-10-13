import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Reads the .env files straight from disk. Vite's own loadEnv cannot be used for this:
// with an empty prefix it lets process.env win over the file, and a dev server restart
// reuses the same Node process — so a key that once landed in process.env could never be
// refreshed from disk again, and an edited .env.local silently kept serving old values.
function readEnvFiles(dir: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const name of ['.env', '.env.local']) {
    let text: string
    try {
      text = readFileSync(`${dir}/${name}`, 'utf8')
    } catch {
      continue // A missing .env file is normal, not an error.
    }
    for (const line of text.split('\n')) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
      if (match) out[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return out
}
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { lessonMeta } from './vite/lessonMeta.ts'
import { usageFlags } from './vite/contentUsage.ts'
import { defaultGroups } from './src/components/lessons/defaultGroups.ts'

// Vercel serves the api/ folder as functions in production, but the Vite dev server
// knows nothing about it — without this, /api/* would 404 under `pnpm dev`. The adapter
// loads the very same handler and bridges Node's req/res to the Web Request/Response
// the function speaks, so there is no second copy of the logic to keep in sync.
function vercelApiDev(siteRoot: string, readEnv: () => Record<string, string>): Plugin {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Runtime secrets (GEMINI_API_KEY, KORREKTUR_KEY) sit in .env.local without a
        // VITE_ prefix, so they never reach the client bundle. In dev they are handed to
        // the handler through process.env, exactly as Vercel does in production.
        //
        // Re-read per request rather than once at startup: editing .env.local otherwise
        // leaves a long-running dev server serving the old keys, which looks exactly
        // like an expired key and wastes an afternoon.
        Object.assign(process.env, readEnv())

        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        void (async () => {
          try {
            const name = url.split('?')[0].slice('/api/'.length)
            const module = await server.ssrLoadModule(path.join(siteRoot, 'api', `${name}.ts`))

            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk as Buffer)
            const headers = Object.entries(req.headers).flatMap(([key, value]) =>
              typeof value === 'string' ? [[key, value] as [string, string]] : [],
            )

            // Resolve the handler exactly the way @vercel/node does: a named export per
            // HTTP method (or `fetch`) is a Web handler and receives a Request. Calling
            // module.default instead would work here and then fail in production, where
            // a default export is invoked Node-style as (req, res).
            const method = (req.method ?? 'GET').toUpperCase()
            const handler = module[method] ?? module.fetch
            if (typeof handler !== 'function') {
              res.statusCode = 405
              res.end()
              return
            }

            const response: Response = await handler(
              new Request(`http://localhost${url}`, {
                method: req.method,
                headers,
                body: chunks.length ? Buffer.concat(chunks) : undefined,
              }),
            )

            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            res.end(Buffer.from(await response.arrayBuffer()))
          } catch (error) {
            next(error)
          }
        })()
      })
    },
  }
}

// https://vite.dev/config/
// This repository is the engine; a site is the engine plus a site root that holds its
// content. SITE_ROOT points at that root (default: this repository, which carries a small
// example site), and the engine reads everything site-specific from there:
//
//   <site root>/content/<target>/   content packs (site.json, target.json, lessons/,
//                                   sources/, quizzes.json, pages/…); bound to '#content'
//   <site root>/content/shared/     data shared by every pack; bound to '#shared'
//   <site root>/public/             static files (audio, images)
//   <site root>/api/                Vercel functions (served by the dev adapter above)
//   <site root>/.env, .env.local    env files; the build writes to <site root>/dist
//
// Each target is its own Vercel project/domain and VITE_LANG names the content pack to
// build. The pack's target.json tells the engine the rest: the language being taught
// (`lang`, which reaches the client as import.meta.env.VITE_TARGET_LANG and names the audio
// folder public/audio/<lang>/), its BCP 47 `locale`, and the brand `title` (the <title> of
// index.html and, via import.meta.env.VITE_BRAND, the in-app brand text). Which
// lesson-specific blocks, quiz engines and pages enter the bundle is decided by the pack's
// own content (vite/contentUsage.ts), so other packs' data and the code only they use never
// reach the bundle.
type Target = { lang: string; locale: string; title: string }

function packNames(contentRoot: string): string[] {
  return readdirSync(contentRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'shared')
    .map((e) => e.name)
    .sort()
}

export default defineConfig(({ mode }) => {
  const engineRoot = fileURLToPath(new URL('.', import.meta.url))
  const siteRoot = path.resolve(engineRoot, process.env.SITE_ROOT ?? '.')
  const contentRoot = path.join(siteRoot, 'content')

  // Only VITE_LANG is needed here, and it arrives as a build env var from the deploy
  // scripts (-b VITE_LANG=de), so process.env has to stay in play — which is exactly
  // why the secrets take the separate readEnvFiles path instead.
  const env = loadEnv(mode, siteRoot, 'VITE_')
  const packs = packNames(contentRoot)
  const pack = env.VITE_LANG ?? packs[0]
  if (!packs.includes(pack)) {
    throw new Error(`No content pack "${pack}" in ${contentRoot} (found: ${packs.join(', ') || 'none'}).`)
  }
  const content = path.join(contentRoot, pack)
  const target = JSON.parse(readFileSync(path.join(content, 'target.json'), 'utf8')) as Target
  const title = target.title
  return {
    envDir: siteRoot,
    publicDir: path.join(siteRoot, 'public'),
    build: { outDir: path.join(siteRoot, 'dist'), emptyOutDir: true },
    server: { fs: { allow: [engineRoot, siteRoot] } },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'lang-title',
        transformIndexHtml: (html) => html.replace(/<title>.*<\/title>/, `<title>${title}</title>`),
      },
      vercelApiDev(siteRoot, () => readEnvFiles(siteRoot)),
      lessonMeta({
        lessons: `${content}/lessons`,
        sources: `${content}/sources`,
        quizzes: `${content}/quizzes.json`,
        defaultGroups,
      }),
    ],
    // Folded into the bundle as constants, so src/config/lang.ts needs no copy of the
    // target table.
    define: {
      'import.meta.env.VITE_TARGET_LANG': JSON.stringify(target.lang),
      'import.meta.env.VITE_TARGET_LOCALE': JSON.stringify(target.locale),
      'import.meta.env.VITE_BRAND': JSON.stringify(title),
      // VITE_BLOCK_* / VITE_ENGINE_* / VITE_PAGE_*: what this pack's content uses.
      ...usageFlags(contentRoot, pack),
    },
    resolve: {
      alias: {
        // Directory aliases: the target's content pack and the data shared by all packs.
        // The data index files glob '#content/lessons/*.json' etc.; page data is imported
        // as '#content/pages/<x>.json'.
        '#content': content,
        '#shared': path.join(contentRoot, 'shared'),
      },
    },
  }
})
