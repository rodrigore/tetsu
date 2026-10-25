import { solve, type SolveInput, type SolveResult } from './solver'

export interface PlanSet {
  /** Percentage of the PR. */
  pct: number
  reps: number
}

export const MAX_SETS = 12
export const MIN_PCT = 10
export const MAX_PCT = 110
export const MAX_PLAN_REPS = 30

export interface PlanTemplate {
  id: string
  name: { es: string; en: string }
  sets: PlanSet[]
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'ramp', name: { es: 'RAMPA', en: 'RAMP' },
    sets: [{ pct: 60, reps: 5 }, { pct: 70, reps: 3 }, { pct: 80, reps: 2 }, { pct: 85, reps: 1 }],
  },
  {
    id: '531', name: { es: '5/3/1 · SEM 1', en: '5/3/1 · WEEK 1' },
    sets: [{ pct: 65, reps: 5 }, { pct: 75, reps: 5 }, { pct: 85, reps: 5 }],
  },
  {
    id: '5x5', name: { es: '5 × 5', en: '5 × 5' },
    sets: Array.from({ length: 5 }, () => ({ pct: 80, reps: 5 })),
  },
  { id: 'empty', name: { es: 'VACÍA', en: 'EMPTY' }, sets: [] },
]

export const clampPct = (n: number): number => Math.min(MAX_PCT, Math.max(MIN_PCT, Math.round(n * 10) / 10))
export const clampReps = (n: number): number => Math.min(MAX_PLAN_REPS, Math.max(1, Math.round(n)))

/** The template whose sets match exactly, so the chip lights up only while untouched. */
export function activeTemplate(sets: PlanSet[]): string | null {
  const same = (a: PlanSet[], b: PlanSet[]) => a.length === b.length && a.every((s, i) => s.pct === b[i]!.pct && s.reps === b[i]!.reps)
  return PLAN_TEMPLATES.find((t) => same(t.sets, sets))?.id ?? null
}

/** A new set after the last one: same as it, or a light first set. */
export const nextSet = (sets: PlanSet[]): PlanSet => (sets.at(-1) ? { ...sets.at(-1)! } : { pct: 60, reps: 5 })

export interface PlanStep extends PlanSet {
  targetKg: number
  result: SolveResult
}

/** Loads every set of the plan for a PR. */
export function planSteps(prKg: number, sets: PlanSet[], base: Omit<SolveInput, 'targetKg'>): PlanStep[] {
  return sets.map((s) => {
    const targetKg = (prKg * s.pct) / 100
    return { ...s, targetKg, result: solve({ ...base, targetKg }) }
  })
}

/** Plate ids of a result, heaviest first, for diffing. */
export const idsOf = (r: SolveResult): string[] => r.perSide.map((p) => p.id)
