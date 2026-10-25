export interface Tone {
  /** Hz. */
  freq: number
  /** Seconds after the start. */
  at: number
  /** Seconds. */
  dur: number
  /** Oscillator shape, sine by default. */
  type?: 'sine' | 'square' | 'triangle' | 'sawtooth'
  /** Peak volume 0..1, 0.35 by default. */
  gain?: number
}

export interface Sound {
  id: string
  name: { es: string; en: string }
  desc: { es: string; en: string }
  tones: Tone[]
}

/** A struck bell: the note plus two inharmonic overtones that die away sooner. */
const bell = (freq: number, at: number, dur: number, gain = 0.35): Tone[] => [
  { freq, at, dur, gain },
  { freq: freq * 2.76, at, dur: dur * 0.6, gain: gain * 0.45 },
  { freq: freq * 5.4, at, dur: dur * 0.35, gain: gain * 0.2 },
]

export const DEFAULT_SOUND = 'tres'

export const SOUNDS: Sound[] = [
  {
    id: 'tres',
    name: { es: 'BIP BIP BIIP', en: 'BEEP BEEP BEEEP' },
    desc: { es: 'Dos tonos cortos y uno largo', en: 'Two short tones and a long one' },
    tones: [
      { freq: 880, at: 0, dur: 0.12 },
      { freq: 880, at: 0.22, dur: 0.12 },
      { freq: 1320, at: 0.44, dur: 0.35 },
    ],
  },
  {
    id: 'campana',
    name: { es: 'CAMPANA', en: 'BELL' },
    desc: { es: 'Una campanada clara', en: 'One clear bell strike' },
    tones: bell(880, 0, 1.6),
  },
  {
    id: 'box',
    name: { es: 'CAMPANA DE BOX', en: 'BOXING BELL' },
    desc: { es: 'Tres campanadas seguidas', en: 'Three strikes in a row' },
    tones: [...bell(660, 0, 1.1), ...bell(660, 0.45, 1.1), ...bell(660, 0.9, 1.6)],
  },
  {
    id: 'digital',
    name: { es: 'DIGITAL', en: 'DIGITAL' },
    desc: { es: 'Cuatro pitidos secos', en: 'Four sharp beeps' },
    tones: [0, 0.16, 0.32, 0.48].map((at) => ({ freq: 1000, at, dur: 0.09, type: 'square' as const, gain: 0.18 })),
  },
  {
    id: 'suave',
    name: { es: 'SUAVE', en: 'SOFT' },
    desc: { es: 'Dos notas tranquilas', en: 'Two calm notes' },
    tones: [
      { freq: 659, at: 0, dur: 0.9, gain: 0.3 },
      { freq: 523, at: 0.35, dur: 1.2, gain: 0.3 },
    ],
  },
  {
    id: 'alarma',
    name: { es: 'ALARMA', en: 'ALARM' },
    desc: { es: 'Alterna dos tonos, difícil de no oír', en: 'Alternates two tones, hard to miss' },
    tones: [0, 1, 2, 3, 4, 5].map((i) => ({ freq: i % 2 ? 660 : 880, at: i * 0.18, dur: 0.16, type: 'triangle' as const, gain: 0.3 })),
  },
  {
    id: 'gong',
    name: { es: 'GONG', en: 'GONG' },
    desc: { es: 'Grave y largo', en: 'Low and long' },
    tones: bell(196, 0, 2.4, 0.5),
  },
]

/** The sound with that id, or the default if it is unknown (a saved choice that no longer exists). */
export const soundOf = (id: string | undefined): Sound => SOUNDS.find((s) => s.id === id) ?? SOUNDS[0]!

/** Seconds until the last tone has died away. */
export const soundLength = (s: Sound): number => Math.max(...s.tones.map((t) => t.at + t.dur))
