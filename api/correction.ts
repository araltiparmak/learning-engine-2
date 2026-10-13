import prompts from '../content/en/prompts.json' with { type: 'json' }
import { createCorrectionHandler } from '../server/correction.ts'

// The example site's endpoint: the engine's handler fed with the example pack's prompts.
// A site built on the engine does the same in its own api/correction.ts, with its own
// content/<lang>/prompts.json files.
export const POST = createCorrectionHandler({ prompts: { en: prompts } })
