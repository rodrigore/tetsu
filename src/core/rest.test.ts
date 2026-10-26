import { describe, expect, it } from 'vitest'
import { BEEP_PATTERN, VIBRATION, alertDone, silentWav, startAudioSession, stopAudioSession, testSound } from './beep'
import { clampRest, clock, remainingSec, ringFraction, splitRest } from './rest'

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
    expect(clampRest(1)).toBe(5)
    expect(clampRest(99999)).toBe(3599)
    expect(clampRest(120)).toBe(120)
    expect(clampRest(37)).toBe(37)
  })
  it('splits seconds into minutes and seconds', () => {
    expect(splitRest(150)).toEqual({ m: 2, s: 30 })
    expect(splitRest(45)).toEqual({ m: 0, s: 45 })
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
  it('builds a valid silent WAV', () => {
    const w = silentWav(1, 8000)
    const text = (o: number, n: number) => String.fromCharCode(...w.slice(o, o + n))
    expect(text(0, 4)).toBe('RIFF')
    expect(text(8, 4)).toBe('WAVE')
    expect(text(36, 4)).toBe('data')
    expect(w.length).toBe(44 + 8000)
    expect(new DataView(w.buffer).getUint32(40, true)).toBe(8000)
    expect(w.slice(44).every((b) => b === 128)).toBe(true)
  })
  it('the audio session and the test button never throw without audio', () => {
    expect(() => {
      startAudioSession()
      testSound()
      stopAudioSession()
      stopAudioSession()
    }).not.toThrow()
  })
})
