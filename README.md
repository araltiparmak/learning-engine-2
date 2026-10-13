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

A site repository keeps its content and depends on a release of this package. A release
carries the packed engine (`learning-engine-<version>.tgz`) as an asset:

```json
{
  "dependencies": {
    "learning-engine": "https://github.com/araltiparmak/learning-engine-2/releases/download/v0.2.0/learning-engine-0.2.0.tgz"
  },
  "scripts": {
    "dev": "VITE_LANG=de learning-engine dev",
    "build": "VITE_LANG=de learning-engine build"
  }
}
```

The `learning-engine` command runs in the site repository; the site root is the working
directory (or `SITE_ROOT`) and the engine reads everything site-specific from there:

| Path under the site root | What it holds |
| --- | --- |
| `content/<target>/` | A content pack: `site.json`, `target.json`, `language.json`, `prompts.json`, `quizzes.json`, `lessons/`, `sources/`, `pages/` |
| `content/shared/` | Data shared by every pack (`sites.json`, study techniques) |
| `public/` | Static files, e.g. `audio/<lang>/` |
| `api/` | Vercel functions; `api/correction.ts` wires `learning-engine/server/correction` to the site's prompts |
| `.env`, `.env.local` | `GEMINI_API_KEY` and `VITE_*` variables |

`VITE_LANG` names the content pack to build; `content/<target>/target.json` holds
`{ "lang", "locale", "title" }`. The build writes to `<site root>/dist`.

### Releasing

```sh
# bump "version" in package.json, commit, then:
pnpm pack                                   # builds server/dist and writes the .tgz
gh release create v<version> learning-engine-<version>.tgz --title v<version>
```

Type checking always runs against the example pack and `types-stub/`: every pack carries
the same schema.
