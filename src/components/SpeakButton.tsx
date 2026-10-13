import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { activeLang } from '../config/lang'
import { hashText } from '../lib/audioHash'
import { t } from '../i18n'

// Read-aloud for the target language. Every clip is pre-generated (gTTS / Gemini TTS, see
// scripts/generate-audio*) and shipped under public/audio/<lang>/. There is deliberately no
// Web Speech API fallback: the browser voice sounds robotic and differs per device, so a text
// without a generated clip gets no button at all rather than a bad reading.
const LANG_PREFIX = activeLang

// manifest.json is an array of file names ("<hash>.mp3" / "<hash>.wav" — the extension depends
// on the generator script), turned here into a hash → file name map. It arrives asynchronously,
// so buttons subscribe to it and appear once their clip is known to exist. A missing folder
// (nothing generated yet) quietly degrades to an empty map: no buttons, no errors.
let audioManifest: Map<string, string> | null = null
const manifestListeners = new Set<() => void>()

function readManifest() {
  return audioManifest
}

function subscribeManifest(listener: () => void) {
  manifestListeners.add(listener)
  return () => void manifestListeners.delete(listener)
}

if (typeof window !== 'undefined') {
  fetch(`/audio/${LANG_PREFIX}/manifest.json`)
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => [])
    .then((files: string[]) => {
      audioManifest = new Map(files.map((f) => [f.slice(0, f.lastIndexOf('.')), f]))
      for (const listener of manifestListeners) listener()
    })
}

// Without a fallback voice a forgotten generation step is invisible in the UI, so name the
// texts that lost their button. Once per text: the same word appears on many pages.
const warned = new Set<string>()
function warnMissingAudio(text: string) {
  if (warned.has(text)) return
  warned.add(text)
  console.warn(`[SpeakButton] no audio file, button hidden: "${text}"`)
}

// Only one text is played at a time. The playing button is tracked here so that when a new
// reading starts (or the clip ends) the previous button can drop out of its "stop" state.
let active: { token: object; resetUI: () => void; stopPlayback: () => void } | null = null

function play(file: string, token: object, onEnd: () => void) {
  active?.resetUI()
  active?.stopPlayback()
  active = null

  const finish = () => {
    if (active?.token !== token) return
    active = null
    onEnd()
  }

  const audio = new Audio(`/audio/${LANG_PREFIX}/${file}`)
  audio.onended = finish
  // A corrupt or half-deployed file ends the reading instead of leaving the button stuck.
  audio.onerror = finish
  active = { token, resetUI: onEnd, stopPlayback: () => audio.pause() }
  audio.play().catch(finish)
}

// Only the button that started a reading may stop it: if another button has taken
// over in the meantime (e.g. while this component unmounts), leave its audio alone.
function stop(token: object) {
  if (active && active.token !== token) return
  active?.resetUI()
  active?.stopPlayback()
  active = null
}

// Stopping only makes sense for long texts (reading passages, paragraphs); a single
// word or sentence is over in one breath, so the button stays plain for those.
const STOPPABLE_MIN_LENGTH = 120

function SpeakButton({ text }: { text: string }) {
  const token = useRef({}).current
  const [speaking, setSpeaking] = useState(false)
  const manifest = useSyncExternalStore(subscribeManifest, readManifest)
  // Stop the audio if the page is left while a text is still being read.
  useEffect(() => () => stop(token), [token])

  const file = manifest?.get(hashText(text))
  if (!file) {
    if (import.meta.env.DEV && manifest) warnMissingAudio(text)
    return null
  }

  const stoppable = text.length >= STOPPABLE_MIN_LENGTH
  const showStop = stoppable && speaking

  return (
    <button
      onClick={() => {
        if (showStop) {
          stop(token)
          return
        }
        play(file, token, () => setSpeaking(false))
        setSpeaking(true)
      }}
      title={showStop ? t.speak.stop : t.speak.listen}
      aria-label={showStop ? t.speak.stopAria : t.speak.readAloud(text)}
      className="ml-1.5 inline-flex align-middle text-base leading-none opacity-60 transition hover:opacity-100"
    >
      {showStop ? '⏹️' : '🔊'}
    </button>
  )
}

export default SpeakButton
