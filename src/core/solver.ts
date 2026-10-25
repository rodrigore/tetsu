import { toKg, type Unit } from './units'

export interface PlateDef {
  /** Stable id, e.g. "45lb" or "2.5kg". */
  id: string
  value: number
  unit: Unit
  /** How many PAIRS you own (one plate per side). */
  pairs: number
}

export type RoundMode = 'near' | 'down' | 'up'

export interface SolveInput {
  targetKg: number
  barKg: number
  collarKg?: number
  plates: PlateDef[]
  mode?: RoundMode
}

export interface SolveResult {
  /** Plates for ONE side, heaviest first. */
  perSide: PlateDef[]
  loadedSideKg: number
  totalKg: number
  /** totalKg - targetKg (positive = over). */
  diffKg: number
  /** Heaviest total reachable with every plate you own. */
  maxTotalKg: number
  /** The target is above what your plates can load. */
  unreachable: boolean
  /** The target is lighter than the empty bar (with collars). */
  belowBar: boolean
}

const UNIT = 100 // integer weights in 0.01 kg
const INF = 9999

/**
 * Picks the plates for one side so the bar lands as close as possible to the target,
 * using at most `pairs` of each plate. Ties go to the fewest plates.
 * Bounded knapsack over 0.01 kg units.
 */
export function solve(input: SolveInput): SolveResult {
  const { targetKg, barKg, collarKg = 0, mode = 'near' } = input
  const defs = input.plates
    .map((p) => ({ p, kg: toKg(p.value, p.unit) }))
    .filter((d) => d.p.pairs > 0 && d.kg > 0)
    .sort((a, b) => b.kg - a.kg)

  const sideT = Math.max(0, (targetKg - barKg - 2 * collarKg) / 2)
  const tu = Math.round(sideT * UNIT)
  const cap = tu + 1500
  const n = defs.length
  const weight = (k: number) => Math.max(1, Math.round(defs[k]!.kg * UNIT))

  const layers: Int16Array[] = [new Int16Array(cap + 1).fill(INF)]
  layers[0]![0] = 0
  const takes: Int8Array[] = []
  for (let k = 0; k < n; k++) {
    const w = weight(k)
    const m = defs[k]!.p.pairs
    const prev = layers[k]!
    const next = new Int16Array(cap + 1).fill(INF)
    const tk = new Int8Array(cap + 1)
    for (let sum = 0; sum <= cap; sum++) {
      const c = prev[sum]!
      if (c >= INF) continue
      for (let j = 0; j <= m; j++) {
        const ns = sum + j * w
        if (ns > cap) break
        if (c + j < next[ns]!) {
          next[ns] = c + j
          tk[ns] = j
        }
      }
    }
    layers.push(next)
    takes.push(tk)
  }

  const fin = layers[n]!
  let best = -1
  let bestScore = Infinity
  let maxSum = 0
  for (let sum = 0; sum <= cap; sum++) {
    if (fin[sum]! >= INF) continue
    maxSum = sum
    let diff = Math.abs(sum - tu)
    if (mode === 'down') {
      if (sum > tu) continue
      diff = tu - sum
    } else if (mode === 'up') {
      if (sum < tu) continue
      diff = sum - tu
    }
    const score = diff * 100 + fin[sum]!
    if (score < bestScore) {
      bestScore = score
      best = sum
    }
  }
  if (best < 0) best = maxSum

  const perSide: PlateDef[] = []
  let walk = best
  for (let k = n - 1; k >= 0; k--) {
    const j = takes[k]![walk]!
    for (let i = 0; i < j; i++) perSide.unshift(defs[k]!.p)
    walk -= j * weight(k)
  }

  const loadedSideKg = perSide.reduce((a, p) => a + toKg(p.value, p.unit), 0)
  const base = barKg + 2 * collarKg
  const totalKg = base + 2 * loadedSideKg
  const maxSideKg = defs.reduce((a, d) => a + d.kg * d.p.pairs, 0)
  const maxTotalKg = base + 2 * maxSideKg
  return {
    perSide,
    loadedSideKg,
    totalKg,
    diffKg: totalKg - targetKg,
    maxTotalKg,
    unreachable: targetKg > maxTotalKg + 0.05,
    belowBar: targetKg < base - 0.05,
  }
}
