import { describe, expect, it } from 'vitest'
import { allPlates, defaultPairs } from './catalog'
import { roundOptions } from './rounding'

const plates = allPlates([]).map((p) => ({ id: p.id, value: p.value, unit: p.unit, pairs: defaultPairs(p.id) }))
const input = (targetKg: number, over = {}) => ({ targetKg, barKg: 20, collarKg: 0, plates, ...over })

describe('roundOptions', () => {
  it('offers a lighter and a heavier load around an unreachable-exact target', () => {
    const o = roundOptions(input(119))
    expect(o.length).toBeGreaterThanOrEqual(2)
    const totals = o.map((x) => x.result.totalKg)
    expect(Math.min(...totals)).toBeLessThanOrEqual(119)
    expect(Math.max(...totals)).toBeGreaterThanOrEqual(119)
    expect(o.some((x) => x.mode === 'near')).toBe(true)
  })
  it('never repeats a weight', () => {
    const totals = roundOptions(input(119)).map((x) => x.result.totalKg.toFixed(3))
    expect(new Set(totals).size).toBe(totals.length)
  })
  it('is empty when the target loads exactly', () => {
    expect(roundOptions(input(20))).toEqual([])
    const kg = [{ id: '25kg', value: 25, unit: 'kg' as const, pairs: 2 }]
    expect(roundOptions(input(70, { plates: kg }))).toEqual([])
  })
  it('is empty below the bar or beyond the plates', () => {
    expect(roundOptions(input(10))).toEqual([])
    expect(roundOptions(input(5000))).toEqual([])
  })
  it('the lighter option is not over and the heavier is not under', () => {
    const o = roundOptions(input(119))
    const down = o.find((x) => x.mode === 'down')
    const up = o.find((x) => x.mode === 'up')
    if (down) expect(down.result.totalKg).toBeLessThanOrEqual(119 + 1e-6)
    if (up) expect(up.result.totalKg).toBeGreaterThanOrEqual(119 - 1e-6)
  })
})
