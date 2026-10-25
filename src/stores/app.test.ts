import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useApp } from './app'
import { useToast } from './toast'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('app store', () => {
  it('starts in the minimal view with example lifts', () => {
    const app = useApp()
    expect(app.s.look).toBe('minimal')
    expect(app.s.lifts.every((l) => l.example)).toBe(true)
  })

  it('remembers one percentage per lift', () => {
    const app = useApp()
    app.s.pct = 70
    app.s.liftId = 'deadlift'
    app.s.pct = 90
    app.s.liftId = 'back'
    expect(app.s.pct).toBe(70)
    app.s.liftId = 'deadlift'
    expect(app.s.pct).toBe(90)
  })

  it('keeps the current percentage for a lift that has none yet', () => {
    const app = useApp()
    app.s.pct = 75
    app.s.liftId = 'snatch'
    expect(app.s.pct).toBe(75)
  })

  it('factory presets: BOX is one-hand, GIMNASIO is not', () => {
    const app = useApp()
    const gym = app.s.presets.find((p) => p.id === 'gym')!
    const box = app.s.presets.find((p) => p.id === 'box')!
    expect(gym.vals.oneHand).toBe(false)
    expect(box.vals.oneHand).toBe(true)
    expect(gym.vals.look).toBe('minimal')
    expect(box.vals.look).toBe('minimal')
  })
})

describe('toast store', () => {
  it('runs the undo action once and clears the message', () => {
    const toast = useToast()
    let n = 0
    toast.show('Quitado', () => n++)
    expect(toast.current?.text).toBe('Quitado')
    toast.undo()
    toast.undo()
    expect(n).toBe(1)
    expect(toast.current).toBeNull()
  })

  it('replaces the previous message', () => {
    const toast = useToast()
    toast.show('uno')
    toast.show('dos')
    expect(toast.current?.text).toBe('dos')
  })
})
