import { describe, expect, it } from 'vitest'
import { solve, type PlateDef } from './solver'
import { KG_PER_LB, toKg } from './units'

const lb = (v: number, pairs: number): PlateDef => ({ id: `${v}lb`, value: v, unit: 'lb', pairs })
const kg = (v: number, pairs: number): PlateDef => ({ id: `${v}kg`, value: v, unit: 'kg', pairs })

const GYM = [lb(45, 2), lb(35, 2), lb(25, 2), lb(15, 2), lb(10, 2), kg(2.5, 2), kg(2, 2)]

describe('solve', () => {
  it('returns an empty side when target is at or below the bar', () => {
    const r = solve({ targetKg: 20, barKg: 20, plates: GYM })
    expect(r.perSide).toHaveLength(0)
    expect(r.totalKg).toBe(20)
  })

  it('loads two 45 lb plates per side exactly when possible', () => {
    const target = 20 + 2 * 2 * 45 * KG_PER_LB
    const r = solve({ targetKg: target, barKg: 20, plates: GYM })
    expect(r.perSide.map((p) => p.id)).toEqual(['45lb', '45lb'])
    expect(Math.abs(r.diffKg)).toBeLessThan(0.01)
  })

  it('never uses more pairs than owned', () => {
    const r = solve({ targetKg: 400, barKg: 20, plates: GYM })
    const count = (id: string) => r.perSide.filter((p) => p.id === id).length
    for (const p of GYM) expect(count(p.id)).toBeLessThanOrEqual(p.pairs)
  })

  it('subtracts collars from the per-side target', () => {
    const plates = [kg(10, 4)]
    const a = solve({ targetKg: 60, barKg: 20, plates })
    expect(a.totalKg).toBe(60) // 20 bar + 2×20
    // with 2.5 kg collars the per-side target is 17.5 -> nearest is 20, total = 20 + 5 + 40
    const b = solve({ targetKg: 60, barKg: 20, collarKg: 2.5, plates })
    expect(b.totalKg).toBe(65)
  })

  it('down mode never exceeds the target, up mode never undershoots', () => {
    const plates = [kg(10, 2), kg(2.5, 2)]
    const down = solve({ targetKg: 63, barKg: 20, plates, mode: 'down' })
    const up = solve({ targetKg: 63, barKg: 20, plates, mode: 'up' })
    expect(down.totalKg).toBeLessThanOrEqual(63)
    expect(up.totalKg).toBeGreaterThanOrEqual(63)
  })

  it('prefers fewer plates on ties', () => {
    const r = solve({ targetKg: 40, barKg: 20, plates: [kg(5, 4), kg(10, 1)] })
    expect(r.perSide.map((p) => p.id)).toEqual(['10kg'])
  })

  it('falls back to the heaviest reachable load when the target is too high', () => {
    const r = solve({ targetKg: 1000, barKg: 20, plates: [kg(10, 1)] })
    expect(r.totalKg).toBe(40)
  })

  it('mixes lb and kg plates to get close', () => {
    const r = solve({ targetKg: 100, barKg: 20, plates: GYM })
    expect(Math.abs(r.diffKg)).toBeLessThan(1)
    expect(r.loadedSideKg).toBeCloseTo(
      r.perSide.reduce((a, p) => a + toKg(p.value, p.unit), 0),
      6,
    )
  })
})

describe('limits', () => {
  it('flags a target above what the plates can load', () => {
    const r = solve({ targetKg: 500, barKg: 20, plates: [kg(10, 2)] })
    expect(r.unreachable).toBe(true)
    expect(r.maxTotalKg).toBe(60)
    expect(r.totalKg).toBe(60)
  })

  it('does not flag a reachable target', () => {
    const r = solve({ targetKg: 60, barKg: 20, plates: [kg(10, 2)] })
    expect(r.unreachable).toBe(false)
  })

  it('counts collars in the maximum', () => {
    const r = solve({ targetKg: 500, barKg: 20, collarKg: 2.5, plates: [kg(10, 1)] })
    expect(r.maxTotalKg).toBe(20 + 5 + 20)
  })

  it('flags a target lighter than the bar', () => {
    const r = solve({ targetKg: 12, barKg: 20, plates: GYM })
    expect(r.belowBar).toBe(true)
    expect(r.totalKg).toBe(20)
    expect(solve({ targetKg: 20, barKg: 20, plates: GYM }).belowBar).toBe(false)
  })
})
