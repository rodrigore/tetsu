import { describe, expect, it } from 'vitest'
import { warmupSteps } from './warmup'
import type { PlateDef } from './solver'

const plates: PlateDef[] = [
  { id: '20kg', value: 20, unit: 'kg', pairs: 4 },
  { id: '10kg', value: 10, unit: 'kg', pairs: 4 },
  { id: '5kg', value: 5, unit: 'kg', pairs: 4 },
  { id: '2.5kg', value: 2.5, unit: 'kg', pairs: 4 },
]
const base = { barKg: 20, plates }

describe('warmupSteps', () => {
  it('starts with the empty bar, then climbs', () => {
    const s = warmupSteps(140, [40, 60, 80], base)
    expect(s.map((x) => x.pct)).toEqual([null, 40, 60, 80])
    expect(s[0]!.result.perSide).toHaveLength(0)
    const totals = s.map((x) => x.result.totalKg)
    expect([...totals].sort((a, b) => a - b)).toEqual(totals)
  })

  it('sorts, de-duplicates and drops invalid percentages', () => {
    const s = warmupSteps(140, [80, 40, 40, 0, -5, 100, 120, NaN], base)
    expect(s.map((x) => x.pct)).toEqual([null, 40, 80])
  })

  it('skips steps lighter than the bar', () => {
    const s = warmupSteps(30, [40, 80], base) // 12 kg and 24 kg vs a 20 kg bar
    expect(s.map((x) => x.pct)).toEqual([null, 80])
  })

  it('computes each step from the working weight', () => {
    const s = warmupSteps(100, [50], base)
    expect(s[1]!.targetKg).toBe(50)
    expect(s[1]!.result.totalKg).toBe(50)
  })
})
