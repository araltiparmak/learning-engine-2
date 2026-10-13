import { useEffect, useRef, useState } from 'react'

// Player for the listening tests. SpeakButton is deliberately not reused here: it reads
// one sentence through a hash lookup and offers nothing but play/stop, while a listening
// exercise lives on the three controls below — scrub back to the sentence you missed,
// slow the speakers down, start over — and on a file addressed by test id rather than by
// a hash of its text.
const SPEEDS = [0.75, 1]

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function AudioPlayer({ src, fallbackDuration }: { src: string; fallbackDuration?: number }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  // Until metadata loads, the length written in the JSON keeps the progress bar from
  // rendering against a NaN duration.
  const [duration, setDuration] = useState(fallbackDuration ?? 0)
  const [speed, setSpeed] = useState(1)

  // A new test means a new file: reset, or the previous position and play state leak
  // into it when navigating between two listening tests.
  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(fallbackDuration ?? 0)
  }, [src, fallbackDuration])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  const seekBy = (delta: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration || 0)
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? 'Duraklat' : 'Dinle'}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl text-white transition hover:bg-brand-600"
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => {
              const time = Number(e.target.value)
              setCurrent(time)
              if (audioRef.current) audioRef.current.currentTime = time
            }}
            aria-label="Kaydın konumu"
            className="w-full accent-brand-500"
          />
          <div className="mt-0.5 flex justify-between text-xs tabular-nums text-gray-500">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => seekBy(-10)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          ↺ 10 sn
        </button>
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = 0
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          Baştan
        </button>
        <span className="ml-auto flex items-center gap-1 text-sm text-gray-500">
          Hız
          {SPEEDS.map((value) => (
            <button
              key={value}
              onClick={() => setSpeed(value)}
              aria-pressed={speed === value}
              className={`rounded-lg border px-2.5 py-1 text-sm transition ${
                speed === value
                  ? 'border-brand-500 bg-brand-500 font-semibold text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-brand-400'
              }`}
            >
              {value}×
            </button>
          ))}
        </span>
      </div>
    </div>
  )
}

export default AudioPlayer
