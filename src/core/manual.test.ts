import { describe, expect, it } from 'vitest'
import { addPlate, countOf, manualTotalKg, removeLast } from './manual'
import type { PlateDef } from './solver'

const p45: PlateDef = { id: '45lb', value: 45, unit: 'lb', pairs: 2 }
const p25: PlateDef = { id: '25kg', value: 25, unit: 'kg', pairs: 1 }
const defs = [p45, p25]

describe('manual load', () => {
  it('adds plates in tap order up to the pairs you own', () => {
    let s: string[] = []
    s = addPlate(s, p45)
    s = addPlate(s, p25)
    s = addPlate(s, p45)
    s = addPlate(s, p45)
    s = addPlate(s, p25)
    expect(s).toEqual(['45lb', '25kg', '45lb'])
    expect(countOf(s, '45lb')).toBe(2)
    expect(countOf(s, '25kg')).toBe(1)
  })
  it('removes the last one and tolerates an empty stack', () => {
    expect(removeLast(['45lb', '25kg'])).toEqual(['45lb'])
    expect(removeLast([])).toEqual([])
  })
  it('totals bar + both sides + collars', () => {
    expect(manualTotalKg([], defs, 20)).toBe(20)
    expect(manualTotalKg(['25kg'], defs, 20)).toBe(70)
    expect(manualTotalKg(['25kg'], defs, 20, 2.5)).toBe(75)
    expect(manualTotalKg(['45lb'], defs, 20)).toBeCloseTo(20 + 2 * 45 * 0.45359237, 5)
  })
  it('ignores ids that are not in the inventory', () => {
    expect(manualTotalKg(['nope'], defs, 20)).toBe(20)
  })
})
