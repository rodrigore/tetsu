import { describe, expect, it } from 'vitest'
import { estimate1RM, roundPr, validReps } from './oneRm'

describe('estimate1RM', () => {
  it('Epley: 130 kg x 5 is about 151.7', () => {
    expect(estimate1RM(130, 5, 'epley')!).toBeCloseTo(151.667, 2)
  })
  it('Brzycki: 130 kg x 5 is 146.25', () => {
    expect(estimate1RM(130, 5, 'brzycki')!).toBeCloseTo(146.25, 2)
  })
  it('one rep is the weight itself in both formulas', () => {
    expect(estimate1RM(140, 1, 'epley')).toBe(140)
    expect(estimate1RM(140, 1, 'brzycki')).toBe(140)
  })
  it('rejects input it cannot estimate', () => {
    expect(estimate1RM(0, 5, 'epley')).toBeNull()
    expect(estimate1RM(-5, 5, 'epley')).toBeNull()
    expect(estimate1RM(100, 0, 'epley')).toBeNull()
    expect(estimate1RM(100, 2.5, 'epley')).toBeNull()
    expect(estimate1RM(100, 31, 'brzycki')).toBeNull()
    expect(estimate1RM(Number.NaN, 5, 'epley')).toBeNull()
  })
  it('grows with reps and weight', () => {
    expect(estimate1RM(100, 8, 'epley')!).toBeGreaterThan(estimate1RM(100, 5, 'epley')!)
    expect(estimate1RM(110, 5, 'brzycki')!).toBeGreaterThan(estimate1RM(100, 5, 'brzycki')!)
  })
  it('validReps accepts whole numbers 1..30', () => {
    expect(validReps(1)).toBe(true)
    expect(validReps(30)).toBe(true)
    expect(validReps(31)).toBe(false)
    expect(validReps(3.5)).toBe(false)
  })
  it('roundPr keeps one decimal', () => {
    expect(roundPr(151.667)).toBe(151.7)
    expect(roundPr(140)).toBe(140)
  })
})
