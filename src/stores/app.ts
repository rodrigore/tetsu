import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import type { Lang } from '../core/i18n'
import type { RoundMode } from '../core/solver'
import type { Unit } from '../core/units'

export interface Lift {
  id: string
  name: string | { en: string; es: string }
  kg: number
}

export interface Bar {
  value: number
  unit: Unit
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
}

const KEY = 'tetsu:v1'

const defaults = (): Settings => ({
  lang: 'es',
  unit: 'kg',
  theme: 'dark',
  accent: '#FF5A1F',
  look: 'full',
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
    { id: 'back', name: { en: 'BACK SQUAT', es: 'SENTADILLA TRASERA' }, kg: 140 },
    { id: 'front', name: { en: 'FRONT SQUAT', es: 'SENTADILLA FRONTAL' }, kg: 115 },
    { id: 'deadlift', name: { en: 'DEADLIFT', es: 'PESO MUERTO' }, kg: 180 },
    { id: 'snatch', name: { en: 'SNATCH', es: 'ARRANQUE' }, kg: 85 },
    { id: 'clean', name: { en: 'CLEAN', es: 'CARGADA' }, kg: 100 },
  ],
  liftId: 'back',
  pct: 85,
  customPlates: [],
  pstep: 1,
  quick: [60, 70, 80, 90, 95, 100],
})

function load(): Settings {
  const base = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...base, ...(JSON.parse(raw) as Partial<Settings>) }
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

  const liftName = (l: Lift) =>
    (typeof l.name === 'string' ? l.name : l.name[s.lang]).toLocaleUpperCase(s.lang)

  return { s, lift, bar, liftName }
})
