import { CATALOG, defaultPairs, plateId } from './catalog'
import type { Bar, Settings } from '../stores/app'
import type { Unit } from './units'

export type ProfileId = 'gym' | 'box' | 'kilos' | 'home'

export interface Profile {
  id: ProfileId
  bars: Bar[]
  unit: Unit
  /** Pairs per plate id; any catalog plate not listed is set to 0. */
  pairs: Record<string, number>
  /** Display choices that go with this place. */
  vals: Partial<Pick<Settings, 'hero' | 'oneHand'>>
}

export const PROFILES: Profile[] = [
  {
    id: 'gym',
    bars: [{ value: 45, unit: 'lb' }, { value: 35, unit: 'lb' }],
    unit: 'lb',
    pairs: { '45lb': 2, '35lb': 1, '25lb': 1, '10lb': 2, '5lb': 1 },
    vals: { hero: 'side', oneHand: false },
  },
  {
    id: 'box',
    bars: [{ value: 20, unit: 'kg' }, { value: 15, unit: 'kg' }],
    unit: 'kg',
    pairs: { '25kg': 2, '20kg': 2, '15kg': 2, '10kg': 2, '5kg': 2, '2.5kg': 2, '2kg': 1, '1kg': 1, '0.5kg': 1, '0.25kg': 1 },
    vals: { hero: 'target', oneHand: true },
  },
  {
    id: 'kilos',
    bars: [{ value: 20, unit: 'kg' }],
    unit: 'kg',
    pairs: { '25kg': 2, '20kg': 2, '15kg': 2, '10kg': 2, '5kg': 2, '2.5kg': 2, '1kg': 1, '0.5kg': 1 },
    vals: { hero: 'side', oneHand: false },
  },
  {
    id: 'home',
    bars: [{ value: 20, unit: 'kg' }],
    unit: 'kg',
    pairs: { '20kg': 1, '10kg': 2, '5kg': 2, '2.5kg': 2, '1kg': 1, '0.5kg': 1 },
    vals: { hero: 'side', oneHand: false },
  },
]

export const profileOf = (id: ProfileId): Profile => PROFILES.find((p) => p.id === id)!

/** Pairs for every standard plate the profile leaves out are 0, so the solver only sees what the place has. */
export function profileInventory(p: Profile): Record<string, number> {
  const out: Record<string, number> = {}
  for (const c of CATALOG) {
    const id = plateId(c)
    out[id] = p.pairs[id] ?? 0
  }
  return out
}

/** Snapshot of what a profile changes, to undo it. */
export interface ProfileUndo {
  bars: Bar[]
  barIndex: number
  inventory: Record<string, number>
  unit: Unit
  hero: Settings['hero']
  oneHand: boolean
}

export function snapshot(s: Settings): ProfileUndo {
  return {
    bars: s.bars.map((b) => ({ ...b })),
    barIndex: s.barIndex,
    inventory: { ...s.inventory },
    unit: s.unit,
    hero: s.hero,
    oneHand: s.oneHand,
  }
}

export function restore(s: Settings, u: ProfileUndo): void {
  s.bars = u.bars
  s.barIndex = u.barIndex
  s.inventory = u.inventory
  s.unit = u.unit
  s.hero = u.hero
  s.oneHand = u.oneHand
}

/** Custom plates the user added are kept; everything else is replaced by the profile. */
export function applyProfile(s: Settings, id: ProfileId): void {
  const p = profileOf(id)
  s.bars = p.bars.map((b) => ({ ...b }))
  s.barIndex = 0
  s.inventory = { ...profileInventory(p), ...Object.fromEntries(Object.entries(s.inventory).filter(([k]) => k.startsWith('c:'))) }
  s.unit = p.unit
  if (p.vals.hero) s.hero = p.vals.hero
  if (p.vals.oneHand !== undefined) s.oneHand = p.vals.oneHand
}

/** The profile whose bars, unit and plates match the current settings, if any. */
export function currentProfile(s: Settings): ProfileId | null {
  for (const p of PROFILES) {
    const inv = profileInventory(p)
    const sameBars = s.bars.length === p.bars.length && s.bars.every((b, i) => b.value === p.bars[i]!.value && b.unit === p.bars[i]!.unit)
    const samePlates = Object.entries(inv).every(([id, n]) => (s.inventory[id] ?? defaultPairs(id)) === n)
    if (sameBars && samePlates && s.unit === p.unit) return p.id
  }
  return null
}
