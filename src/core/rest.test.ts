import { describe, expect, it } from 'vitest'
import { BEEP_PATTERN, VIBRATION, alertDone } from './beep'
import { clampRest, clock, remainingSec, ringFraction } from './rest'

describe('rest timer', () => {
  it('counts down from the end time and never goes negative', () => {
    expect(remainingSec(10_000, 0)).toBe(10)
    expect(remainingSec(10_000, 9_001)).toBe(1)
    expect(remainingSec(10_000, 10_000)).toBe(0)
    expect(remainingSec(10_000, 25_000)).toBe(0)
  })
  it('formats m:ss', () => {
    expect(clock(75)).toBe('1:15')
    expect(clock(120)).toBe('2:00')
    expect(clock(9)).toBe('0:09')
    expect(clock(-3)).toBe('0:00')
  })
  it('clamps the rest length', () => {
    expect(clampRest(5)).toBe(15)
    expect(clampRest(9999)).toBe(600)
    expect(clampRest(120)).toBe(120)
  })
  it('ring fraction stays within 0..1', () => {
    expect(ringFraction(60, 120)).toBe(0.5)
    expect(ringFraction(200, 120)).toBe(1)
    expect(ringFraction(0, 0)).toBe(0)
  })
})

describe('alert', () => {
  it('is three tones, the last longer and higher', () => {
    expect(BEEP_PATTERN).toHaveLength(3)
    expect(BEEP_PATTERN[2]!.dur).toBeGreaterThan(BEEP_PATTERN[0]!.dur)
    expect(BEEP_PATTERN[2]!.freq).toBeGreaterThan(BEEP_PATTERN[0]!.freq)
    expect(VIBRATION.length).toBeGreaterThan(0)
  })
  it('does not throw where there is no audio (node)', () => {
    expect(() => alertDone()).not.toThrow()
  })
})
