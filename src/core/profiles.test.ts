import { describe, expect, it } from 'vitest'
import { applyProfile, currentProfile, PROFILES, profileInventory, profileOf, restore, snapshot } from './profiles'
import { CATALOG, plateId } from './catalog'
import { createPinia, setActivePinia } from 'pinia'
import { useApp } from '../stores/app'

describe('profiles', () => {
  it('covers every standard plate, with 0 for the ones a place does not have', () => {
    for (const p of PROFILES) {
      const inv = profileInventory(p)
      expect(Object.keys(inv).sort()).toEqual(CATALOG.map(plateId).sort())
    }
    expect(profileInventory(profileOf('gym'))['25kg']).toBe(0)
    expect(profileInventory(profileOf('box'))['20kg']).toBe(2)
  })

  it('applies bars, unit, inventory and keeps custom plates', () => {
    setActivePinia(createPinia())
    const app = useApp()
    app.s.inventory['c:3kg'] = 1
    applyProfile(app.s, 'gym')
    expect(app.s.bars[0]).toEqual({ value: 45, unit: 'lb' })
    expect(app.s.unit).toBe('lb')
    expect(app.s.inventory['45lb']).toBe(2)
    expect(app.s.inventory['c:3kg']).toBe(1)
    applyProfile(app.s, 'box')
    expect(app.s.unit).toBe('kg')
    expect(app.s.hero).toBe('target')
    expect(app.s.oneHand).toBe(true)
  })

  it('can be undone', () => {
    setActivePinia(createPinia())
    const app = useApp()
    const before = snapshot(app.s)
    applyProfile(app.s, 'home')
    restore(app.s, before)
    expect(app.s.bars).toEqual(before.bars)
    expect(app.s.inventory).toEqual(before.inventory)
    expect(app.s.unit).toBe(before.unit)
  })

  it('tells which profile is active until the plates are edited', () => {
    setActivePinia(createPinia())
    const app = useApp()
    applyProfile(app.s, 'box')
    expect(currentProfile(app.s)).toBe('box')
    app.s.inventory['25kg'] = 5
    expect(currentProfile(app.s)).toBeNull()
  })
})
