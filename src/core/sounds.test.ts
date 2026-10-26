import { describe, expect, it } from 'vitest'
import { BEEP_PATTERN } from './beep'
import { DEFAULT_SOUND, SOUNDS, soundLength, soundOf } from './sounds'

describe('sound gallery', () => {
  it('has distinct ids and a name and description in both languages', () => {
    const ids = SOUNDS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(SOUNDS.length).toBeGreaterThanOrEqual(6)
    for (const s of SOUNDS) {
      expect(s.name.es && s.name.en && s.desc.es && s.desc.en).toBeTruthy()
    }
  })
  it('every tone is playable', () => {
    for (const s of SOUNDS) {
      expect(s.tones.length).toBeGreaterThan(0)
      for (const t of s.tones) {
        expect(t.freq).toBeGreaterThan(20)
        expect(t.freq).toBeLessThan(12000)
        expect(t.dur).toBeGreaterThan(0)
        expect(t.at).toBeGreaterThanOrEqual(0)
        if (t.gain !== undefined) expect(t.gain).toBeGreaterThan(0)
        if (t.gain !== undefined) expect(t.gain).toBeLessThanOrEqual(1)
      }
    }
  })
  it('none runs longer than 3 seconds', () => {
    for (const s of SOUNDS) expect(soundLength(s)).toBeLessThanOrEqual(3)
  })
  it('falls back to the default for an unknown or missing id', () => {
    expect(soundOf(undefined).id).toBe(DEFAULT_SOUND)
    expect(soundOf('gone').id).toBe(DEFAULT_SOUND)
    expect(soundOf('gong').id).toBe('gong')
  })
  it('the default is the classic three-tone beep', () => {
    expect(BEEP_PATTERN).toEqual(soundOf(DEFAULT_SOUND).tones)
    expect(BEEP_PATTERN).toHaveLength(3)
  })
})
