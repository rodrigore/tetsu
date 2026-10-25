import { defaultShare, type CardStyle } from '../core/shareCard'
import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import type { Lang } from '../core/i18n'
import type { Formula } from '../core/oneRm'
import { PLAN_TEMPLATES, type PlanSet } from '../core/plan'
import type { RoundMode } from '../core/solver'
import type { Unit } from '../core/units'

export interface Lift {
  id: string
  name: string | { en: string; es: string }
  kg: number
  /** Last percentage used with this lift. */
  pct?: number
  /** Sample lift that has not been edited yet. */
  example?: boolean
}

export interface Bar {
  value: number
  unit: Unit
}

export const PRESET_KEYS = [
  'look', 'hero', 'side', 'oneHand', 'tsize', 'contrast', 'theme', 'olympic', 'porient', 'showDiff', 'awake',
] as const

export interface Preset {
  id: string
  /** Seeded presets are translated; the ones you save keep your text. */
  name: string | { en: string; es: string }
  seed?: boolean
  vals: Partial<Pick<Settings, (typeof PRESET_KEYS)[number]>>
}

export interface Settings {
  lang: Lang
  unit: Unit
  theme: 'auto' | 'dark' | 'light'
  accent: string
  look: 'full' | 'minimal'
  hero: 'side' | 'target' | 'total'
  side: 'kg' | 'lb' | 'both'
  round: RoundMode
  showDiff: boolean
  porient: 'horizontal' | 'vertical'
  tsize: 'normal' | 'large'
  contrast: 'normal' | 'high'
  olympic: boolean
  bars: Bar[]
  barIndex: number
  collarKg: number
  inventory: Record<string, number>
  lifts: Lift[]
  liftId: string
  pct: number
  customPlates: Bar[]
  pstep: number
  quick: number[]
  oneHand: boolean
  awake: boolean
  presets: Preset[]
  presetId: string | null
  guideDone: boolean
  /** Bumped when a default changes in a way existing installs should pick up once. */
  schema: number
  /** Plate ids per side that are on the bar right now (marked by the user). */
  onBar: string[] | null
  /** Warm-up percentages of the working weight. */
  warm: number[]
  installDismissed: boolean
  /** Last choices in the share sheet. */
  share: CardStyle
  /** Formula for the PR estimate from reps. */
  e1rm: Formula
  /** Training: the sets (percentage and reps) and how the rest between them behaves. */
  plan: { sets: PlanSet[]; rest: number; auto: boolean; sound: boolean }
}

const KEY = 'tetsu:v1'

const defaults = (): Settings => ({
  lang: 'es',
  unit: 'kg',
  theme: 'dark',
  accent: '#FF5A1F',
  look: 'minimal',
  hero: 'side',
  side: 'both',
  round: 'near',
  showDiff: true,
  porient: 'horizontal',
  tsize: 'large',
  contrast: 'high',
  olympic: true,
  bars: [
    { value: 20, unit: 'kg' },
    { value: 15, unit: 'kg' },
  ],
  barIndex: 0,
  collarKg: 0,
  inventory: {},
  lifts: [
    { id: 'back', name: { en: 'BACK SQUAT', es: 'SENTADILLA TRASERA' }, kg: 140, example: true },
    { id: 'front', name: { en: 'FRONT SQUAT', es: 'SENTADILLA FRONTAL' }, kg: 115, example: true },
    { id: 'deadlift', name: { en: 'DEADLIFT', es: 'PESO MUERTO' }, kg: 180, example: true },
    { id: 'snatch', name: { en: 'SNATCH', es: 'ARRANQUE' }, kg: 85, example: true },
    { id: 'clean', name: { en: 'CLEAN', es: 'CARGADA' }, kg: 100, example: true },
  ],
  liftId: 'back',
  pct: 85,
  customPlates: [],
  pstep: 1,
  quick: [60, 70, 80, 90, 95, 100],
  oneHand: false,
  awake: false,
  presets: [
    {
      id: 'gym', seed: true, name: { es: 'GIMNASIO', en: 'GYM' },
      vals: { look: 'minimal', hero: 'side', oneHand: false, tsize: 'large', contrast: 'high', porient: 'horizontal', showDiff: false, awake: true },
    },
    {
      id: 'box', seed: true, name: { es: 'BOX', en: 'BOX' },
      vals: { look: 'minimal', hero: 'target', oneHand: true, tsize: 'large', contrast: 'high', porient: 'horizontal', showDiff: true, awake: true },
    },
  ],
  presetId: null,
  guideDone: false,
  schema: 2,
  onBar: null,
  warm: [40, 60, 80],
  installDismissed: false,
  share: defaultShare(),
  e1rm: 'epley',
  plan: { sets: PLAN_TEMPLATES[0]!.sets.map((x) => ({ ...x })), rest: 120, auto: true, sound: true },
})

function load(): Settings {
  const base = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings>
      // Factory presets always come from the app, so improvements reach existing installs;
      // the ones the user saved are kept as they are.
      const own = (saved.presets ?? []).filter((p) => !p.seed)
      const merged = { ...base, ...saved, share: { ...base.share, ...saved.share }, plan: { ...base.plan, ...saved.plan }, presets: [...base.presets, ...own] }
      // v2: the minimal view became the default. Applied once, then your own choice sticks.
      if ((saved.schema ?? 1) < 2) {
        merged.look = 'minimal'
        merged.schema = 2
      }
      return merged
    }
  } catch {
    /* storage blocked or corrupt: start from defaults */
  }
  return base
}

export const useApp = defineStore('app', () => {
  const s = reactive<Settings>(load())

  watch(
    s,
    () => {
      try {
        localStorage.setItem(KEY, JSON.stringify(s))
      } catch {
        /* ignore quota / private mode */
      }
    },
    { deep: true },
  )

  const lift = computed(() => s.lifts.find((l) => l.id === s.liftId) ?? s.lifts[0]!)
  const bar = computed(() => s.bars[s.barIndex] ?? s.bars[0]!)

  // Each lift remembers its own percentage; switching lift restores it.
  if (lift.value.pct !== undefined) s.pct = lift.value.pct
  watch(() => s.pct, (v) => { lift.value.pct = v }, { flush: 'sync' })
  watch(() => s.liftId, () => { s.pct = lift.value.pct ?? s.pct }, { flush: 'sync' })

  const liftName = (l: Lift) =>
    (typeof l.name === 'string' ? l.name : l.name[s.lang]).toLocaleUpperCase(s.lang)

  return { s, lift, bar, liftName }
})
