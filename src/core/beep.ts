export interface Tone {
  /** Hz. */
  freq: number
  /** Seconds after the start. */
  at: number
  /** Seconds. */
  dur: number
}

/** "bip bip BIIP": two short tones and a longer, higher one. */
export const BEEP_PATTERN: Tone[] = [
  { freq: 880, at: 0, dur: 0.12 },
  { freq: 880, at: 0.22, dur: 0.12 },
  { freq: 1320, at: 0.44, dur: 0.35 },
]

export const VIBRATION: number[] = [120, 80, 120, 80, 320]

type AudioCtor = typeof AudioContext
let ctx: AudioContext | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext
  if (!Ctor) return null
  try {
    ctx ??= new Ctor()
  } catch {
    return null
  }
  return ctx
}

/** A second of silence as a WAV file (8-bit mono). */
export function silentWav(seconds = 1, rate = 8000): Uint8Array {
  const n = Math.round(rate * seconds)
  const b = new Uint8Array(44 + n)
  const v = new DataView(b.buffer)
  const tag = (o: number, t: string) => [...t].forEach((ch, i) => (b[o + i] = ch.charCodeAt(0)))
  tag(0, 'RIFF')
  v.setUint32(4, 36 + n, true)
  tag(8, 'WAVE')
  tag(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true) // PCM
  v.setUint16(22, 1, true) // mono
  v.setUint32(24, rate, true)
  v.setUint32(28, rate, true) // bytes per second
  v.setUint16(32, 1, true) // block align
  v.setUint16(34, 8, true) // bits
  tag(36, 'data')
  v.setUint32(40, n, true)
  b.fill(128, 44) // 8-bit silence sits at the middle
  return b
}

let keep: HTMLAudioElement | null = null
let holds = 0

/**
 * iPhone mutes Web Audio while the silent switch is on, unless the page is playing media.
 * A looping silent clip (and the "playback" audio session where Safari has it) makes the
 * beep audible. Call from a tap; pair every call with stopAudioSession.
 */
export function startAudioSession(): void {
  holds++
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
  } catch {
    /* not supported */
  }
  try {
    if (!keep && typeof Audio !== 'undefined') {
      keep = new Audio(URL.createObjectURL(new Blob([silentWav() as BlobPart], { type: 'audio/wav' })))
      keep.loop = true
      keep.setAttribute('playsinline', '')
    }
    void keep?.play().catch(() => undefined)
  } catch {
    /* audio blocked */
  }
}

export function stopAudioSession(): void {
  holds = Math.max(0, holds - 1)
  if (holds === 0) keep?.pause()
}

/** Call from a tap: iPhone only lets audio start after a user gesture. */
export function unlockAudio(): void {
  const c = context()
  if (c && c.state !== 'running') void c.resume().catch(() => undefined)
}

/** Plays the three tones and vibrates where the phone allows it. Never throws. */
export function alertDone(): void {
  try {
    navigator.vibrate?.(VIBRATION)
  } catch {
    /* unsupported */
  }
  const c = context()
  if (!c) return
  const play = () => {
    try {
      schedule(c)
    } catch {
      /* audio blocked */
    }
  }
  // iOS can leave the context suspended or interrupted; wake it first.
  if (c.state !== 'running') void c.resume().then(play, play)
  else play()
}

function schedule(c: AudioContext): void {
  {
    const t0 = c.currentTime + 0.02
    for (const tone of BEEP_PATTERN) {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = tone.freq
      const s = t0 + tone.at
      gain.gain.setValueAtTime(0.0001, s)
      gain.gain.exponentialRampToValueAtTime(0.35, s + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, s + tone.dur)
      osc.connect(gain).connect(c.destination)
      osc.start(s)
      osc.stop(s + tone.dur + 0.02)
    }
  }
}

/** The "test sound" button: a tap, so it also unlocks the audio. */
export function testSound(): void {
  unlockAudio()
  startAudioSession()
  alertDone()
  setTimeout(stopAudioSession, 1800)
}
