# learning-engine

The engine behind a family of language-learning sites for Turkish speakers (React 19, Vite,
TypeScript, Tailwind CSS 4, React Router). It holds no site of its own beyond a small
example: lessons, quizzes, audio and deploy settings belong to the site that uses it.

## Example site

This repository builds as-is, with the example content in `content/en/` (one lesson).

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # type-check + production build into dist/
```

It can be deployed to Vercel directly (`vercel deploy --prod`); it then serves the example
content only.

## Using the engine for a real site

A site repository keeps its content and adds this repository as a git submodule (for
example in `engine/`). The engine reads everything site-specific from `SITE_ROOT`:

| Path under `SITE_ROOT` | What it holds |
| --- | --- |
| `content/<target>/` | A content pack: `site.json`, `target.json`, `language.json`, `prompts.json`, `quizzes.json`, `lessons/`, `sources/`, `pages/` |
| `content/shared/` | Data shared by every pack (`sites.json`, study techniques) |
| `public/` | Static files, e.g. `audio/<lang>/` |
| `api/` | Vercel functions; `api/correction.ts` wires `server/correction.ts` to the site's prompts |
| `.env`, `.env.local` | `GEMINI_API_KEY` and `VITE_*` variables |

`VITE_LANG` names the content pack to build; `content/<target>/target.json` holds
`{ "lang", "locale", "title" }`. The build writes to `<SITE_ROOT>/dist`.

```sh
SITE_ROOT=.. VITE_LANG=de pnpm build
```

Type checking always runs against the example pack and `types-stub/`: every pack carries
the same schema.
