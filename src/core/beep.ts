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

/** Call from a tap: iPhone only lets audio start after a user gesture. */
export function unlockAudio(): void {
  const c = context()
  if (c && c.state === 'suspended') void c.resume().catch(() => undefined)
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
  try {
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
  } catch {
    /* audio blocked */
  }
}
