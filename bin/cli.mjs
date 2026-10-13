#!/usr/bin/env node
// `learning-engine dev|build|preview`: runs the engine for the site in the current
// directory. The site root (content/, public/, api/, env files) is the working directory
// unless SITE_ROOT says otherwise; the build goes to <site root>/dist.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, createServer, preview } from 'vite'

const command = process.argv[2]
const engineRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
process.env.SITE_ROOT = path.resolve(process.env.SITE_ROOT ?? process.cwd())

const config = { root: engineRoot, configFile: path.join(engineRoot, 'vite.config.ts') }

if (command === 'build') {
  await build(config)
} else if (command === 'dev') {
  const server = await createServer(config)
  await server.listen()
  server.printUrls()
} else if (command === 'preview') {
  const server = await preview(config)
  server.printUrls()
} else {
  console.error('Usage: learning-engine dev|build|preview')
  process.exit(1)
}
