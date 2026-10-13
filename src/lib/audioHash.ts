// The hash SpeakButton uses to locate a pre-generated (Gemini TTS) audio file.
// Must stay byte-for-byte identical to the copies in scripts/generate-audio*.mjs and
// scripts/generate-audio-gtts.py —
// if either one changes, the file names stop matching.
export function hashText(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}
