// The learner-facing Gemini endpoint. `mode` picks the job:
//   'correct'   — the learner writes a sentence in the target language, the model returns
//                 a corrected version (plus its Turkish meaning) and the mistakes explained.
//   'translate' — the learner writes a Turkish sentence, the model returns the target
//                 language version and names the grammar it leans on.
//   'word'      — the learner writes a single word, the model returns a study card:
//                 meaning, forms, examples, opposites (used by the notes widget).
// Runs as a Vercel Function so GEMINI_API_KEY never reaches the browser.
//
// The engine owns this logic; the site that uses the engine owns the prompts. A site wires
// it up in its own api/correction.ts: `export const POST = createCorrectionHandler(...)`.
//
// One endpoint for every mode and every site: the model chain, the throttle and the
// quota are shared, so splitting them would only duplicate the guards. What varies is the
// prompt and the response schema, both picked from a table keyed by mode and `lang`.
//
// It is open on every site. It used to sit behind a shared key on the German one, but the
// widget now renders under every lesson, and a key the page would have to ship to send is
// no key at all. What is left guarding the daily quota: MAX_CHARS, the per-IP throttle
// below, and the model chain that spreads the load over three free-tier allowances.
//
// Required runtime env vars on the Vercel project:
//   GEMINI_API_KEY    — https://aistudio.google.com/apikey
//   WRITING_MODEL     — optional override of the model chain, comma separated
//
// WRITING_MODEL was once KORREKTUR_MODEL; the old name is still read as a fallback so a
// project whose Vercel dashboard has not been updated yet keeps working.
function env(name: string) {
  return process.env[`WRITING_${name}`] ?? process.env[`KORREKTUR_${name}`]
}

// The language being taught, not the language of the explanations — those are always
// Turkish. Mirrors `activeLang` in src/config/lang.ts, which is what the page sends.

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'

// Tried in order. The free tier meters requests per model family, not per key, so a
// spent quota on flash says nothing about flash-lite — dropping down the chain buys a
// fresh daily allowance instead of showing the learner a wall. Quality falls with each
// step, which is why the strongest model leads.
const DEFAULT_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash']

function modelChain(): string[] {
  const override = env('MODEL')
  if (!override) return DEFAULT_MODELS
  const list = override
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  return list.length ? list : DEFAULT_MODELS
}

// A learner sentence, not an essay. The cap is the main cost guard: it bounds input
// tokens per request no matter what is pasted in.
const MAX_CHARS = 300

// Per-instance throttle. Fluid Compute reuses instances, so this catches a burst from one
// address without any external store. With the key gone it is the only thing between a
// determined visitor and the quota, and it is genuinely weak: instances are per region and
// come and go, so the real ceiling is several times MAX_PER_WINDOW. Treat it as a speed
// bump. If the quota starts disappearing, this number — or a shared store — is the lever.
//
// Kept under the Gemini free tier's per-minute allowance so a fast typist trips this
// friendly limit rather than the upstream one, which also burns a daily request.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 8
const hits = new Map<string, { count: number; resetAt: number }>()

function throttled(ip: string) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_PER_WINDOW
}

export type Mode = 'correct' | 'translate' | 'word'

// What the model must return. Field names are English (code), the values it fills in
// are Turkish (content) — see the instruction below.
const CORRECT_SCHEMA = {
  type: 'object',
  properties: {
    corrected: { type: 'string' },
    correctedTr: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          fix: { type: 'string' },
          kind: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['original', 'fix', 'kind', 'explanation'],
      },
    },
    tip: { type: 'string' },
  },
  required: ['corrected', 'correctedTr', 'errors', 'tip'],
}

// The translation direction. `grammar` is the point of the exercise: a plain translation
// is a dictionary, naming the structures it used is a lesson.
const TRANSLATE_SCHEMA = {
  type: 'object',
  properties: {
    translation: { type: 'string' },
    grammar: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['topic', 'note'],
      },
    },
    tip: { type: 'string' },
  },
  required: ['translation', 'grammar', 'tip'],
}

// A word card: what the learner gets for a single word they want to learn. `forms` is a
// free label/value list rather than fixed fields because the useful forms depend on the
// word class (plural for a noun, Perfekt for a verb, Komparativ for an adjective) and on
// the language — a fixed shape would be half empty on every card.
const WORD_SCHEMA = {
  type: 'object',
  properties: {
    headword: { type: 'string' },
    kind: { type: 'string' },
    meaningTr: { type: 'string' },
    meaningEn: { type: 'string' },
    forms: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['label', 'value'],
      },
    },
    examples: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sentence: { type: 'string' },
          tr: { type: 'string' },
        },
        required: ['sentence', 'tr'],
      },
    },
    opposites: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          tr: { type: 'string' },
        },
        required: ['word', 'tr'],
      },
    },
    tip: { type: 'string' },
  },
  required: ['headword', 'kind', 'meaningTr', 'meaningEn', 'forms', 'examples', 'opposites', 'tip'],
}

const SCHEMAS: Record<Mode, unknown> = {
  correct: CORRECT_SCHEMA,
  translate: TRANSLATE_SCHEMA,
  word: WORD_SCHEMA,
}

// The prompts are content: one file per taught language (content/<lang>/prompts.json, the
// English sites sharing content/en/), handed in by the site. They are near-copies on
// purpose: the shared half is the output contract, and the half that differs is the list of
// mistakes a Turkish speaker actually makes in that language, which is what makes the
// explanations land.
export type Prompts = Record<string, Record<Mode, string>>

export type CorrectionOptions = {
  prompts: Prompts
  // The language used when the request names none, or one without prompts. Defaults to the
  // first key of `prompts`.
  defaultLang?: string
}

// What the learner's input is called in the prompt. A word card asks for a word, not a
// sentence, and labelling it as one is exactly how a one-word input gets "corrected"
// into a sentence.
const INPUT_LABELS: Record<Mode, string> = {
  correct: 'Öğrencinin cümlesi',
  translate: 'Öğrencinin cümlesi',
  word: 'Öğrencinin sorduğu kelime',
}

// A word (or a short phrase like "sich freuen auf"), never a paragraph.
const MAX_WORD_CHARS = 60

// thinking_level arrived with the 2.5 generation; older aliases 400 on it. Matching the
// version out of the name is crude, but the unversioned aliases ('gemini-flash-latest')
// always point at a current model, so only an explicitly pinned old one falls through.
function thinks(model: string) {
  return !/-(1\.5|2\.0)-/.test(model)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

// The Interactions API puts the answer in output_text; the step form is the long version
// of the same thing. Both are accepted so a response-shape change does not take the
// endpoint down.
//
// The steps array is not just the answer: reasoning steps come first and carry no
// content at all, so every step has to be checked rather than only the first.
function readText(payload: Record<string, unknown>): string | null {
  const direct = payload.output_text
  if (typeof direct === 'string') return direct

  const steps = payload.steps as { content?: { type?: string; text?: string }[] }[] | undefined
  for (const step of steps ?? []) {
    const part = step.content?.find((c) => c.type === 'text' && typeof c.text === 'string')
    if (part?.text) return part.text
  }
  return null
}

// The site's api/correction.ts exports the result as POST, not as a default export, and
// that is load-bearing: @vercel/node hands a Web Request to a module only when it exports
// named HTTP-method functions (or `fetch`). A default export is always invoked Node-style
// as (req, res), so `req.json` would not exist — which is exactly how this failed the
// first time it was deployed. The Vite dev adapter in vite.config.ts resolves the handler
// the same way, so dev and production agree.
export function createCorrectionHandler({ prompts, defaultLang }: CorrectionOptions) {
  const fallbackLang = defaultLang ?? Object.keys(prompts)[0]
  return (req: Request): Promise<Response> => handle(req, prompts, fallbackLang)
}

async function handle(req: Request, prompts: Prompts, fallbackLang: string): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return json({ error: 'Sunucu yapılandırılmamış.' }, 500)

  const body = (await req.json().catch(() => null)) as
    | { text?: string; focus?: string; lang?: string; mode?: string }
    | null
  if (!body) return json({ error: 'Geçersiz istek.' }, 400)

  // Both default to what the endpoint did before the field existed, so an older client
  // (a cached page) keeps getting corrections in the site's main language, not an error.
  const lang = body.lang && body.lang in prompts ? body.lang : fallbackLang
  const mode: Mode =
    body.mode === 'translate' || body.mode === 'word' ? body.mode : 'correct'

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
  if (throttled(ip)) return json({ error: 'Çok hızlı gittin, bir dakika bekle.' }, 429)

  const text = (body.text ?? '').trim()
  const limit = mode === 'word' ? MAX_WORD_CHARS : MAX_CHARS
  if (!text) return json({ error: mode === 'word' ? 'Önce bir kelime yaz.' : 'Önce bir cümle yaz.' }, 400)
  if (text.length > limit) return json({ error: `En fazla ${limit} karakter.` }, 400)

  // The optional focus comes from the learner ("Perfekt", "TeKaMoLo"…) and only steers
  // the explanations; the model still reports every mistake it sees.
  const focus = (body.focus ?? '').trim().slice(0, 80)
  const instruction = prompts[lang][mode]
  const label = INPUT_LABELS[mode]
  const input = focus
    ? `${instruction}\n\nÖğrencinin çalıştığı konu: ${focus}\n\n${label}:\n${text}`
    : `${instruction}\n\n${label}:\n${text}`

  // Remembered across the chain so the message the learner finally sees describes the
  // wall the first (best) model hit, not whatever the last fallback happened to say.
  let quotaDetail: string | null = null

  for (const model of modelChain()) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        input,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: SCHEMAS[mode],
        },
        // Reasoning is on by default and dominates the bill here: correcting one sentence
        // spent 233 of 261 tokens on thought. 'minimal' takes that to zero, which a
        // single-sentence correction does not miss. Raise it to 'low' if answers slip.
        // Pre-2.5 models have no reasoning to switch off and reject the field outright.
        ...(thinks(model) ? { generation_config: { thinking_level: 'minimal' } } : {}),
      }),
    })

    if (res.ok) {
      const raw = readText((await res.json()) as Record<string, unknown>)
      if (raw) {
        try {
          return json(JSON.parse(raw))
        } catch {
          console.error(`${model} response does not match the schema: ${raw.slice(0, 500)}`)
        }
      } else {
        console.error(`${model} returned an empty response.`)
      }
      // A model that answers but not in the agreed shape is as unusable as one that is
      // out of quota, so the chain continues rather than failing the request here.
      continue
    }

    const detail = await res.text()
    console.error(`Gemini ${model} ${res.status}: ${detail.slice(0, 500)}`)

    // Only the prepaid-balance wording means waiting is pointless, and it is the one
    // case that must not be matched loosely: the quota message mentions billing too, so
    // a broad /billing/ test sends the learner off to top up an account that is fine and
    // will work again in half a minute. It is also the one wall no other model gets
    // around — the balance is per key — so the chain stops here.
    if (res.status === 429 && /prepay|depleted/i.test(detail)) {
      return json({ error: 'Gemini kredisi bitmiş — AI Studio’da bakiyeye bak.' }, 429)
    }

    if (res.status === 429) quotaDetail ??= detail
    // Anything else (a bad request, a model that no longer exists) is not something the
    // next model would answer differently in a useful way, but trying costs one call and
    // saves the learner a dead end.
  }

  // Every model in the chain is out. Gemini reports how long the window has left;
  // passing that on is the difference between "try again shortly" and "come back
  // tomorrow", which the learner cannot otherwise tell apart. The status is passed
  // through rather than flattened to 502: it really is rate limiting.
  if (quotaDetail) {
    const retry = /retry in ([\d.]+)s/i.exec(quotaDetail)
    const wait = retry ? Math.ceil(parseFloat(retry[1])) : 0
    return json(
      {
        error:
          wait > 0 && wait < 300
            ? `Gemini sınırına takıldık, ${wait} saniye sonra tekrar dene.`
            : 'Tüm modellerin kotası doldu. Ücretsiz katmanın günlük hakkı bitmiş olabilir.',
      },
      429,
    )
  }
  const failed: Record<Mode, string> = {
    correct: 'Düzeltme alınamadı.',
    translate: 'Çeviri alınamadı.',
    word: 'Kelime kartı hazırlanamadı.',
  }
  return json({ error: failed[mode] }, 502)
}
