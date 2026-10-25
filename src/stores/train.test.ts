import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useApp } from './app'
import { useToast } from './toast'
import { useTrain } from './train'
import { useUi } from './ui'
import { alertDone } from '../core/beep'

vi.mock('../core/beep', () => ({ alertDone: vi.fn(), unlockAudio: vi.fn() }))

beforeEach(() => {
  vi.mocked(alertDone).mockClear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 25, 12, 0, 0))
  setActivePinia(createPinia())
})
afterEach(() => vi.useRealTimers())

const wait = async (ms: number) => {
  vi.advanceTimersByTime(ms)
  await nextTick()
}

describe('training session', () => {
  it('starts on the first set and closes the plan sheet', () => {
    const train = useTrain()
    const ui = useUi()
    ui.open.plan = true
    train.begin()
    expect(train.phase).toBe('set')
    expect(train.idx).toBe(0)
    expect(train.active).toBe(true)
    expect(ui.open.plan).toBe(false)
  })

  it('does not start without sets', () => {
    const app = useApp()
    app.s.plan.sets = []
    const train = useTrain()
    train.begin()
    expect(train.phase).toBe('off')
  })

  it('rests after a set when the rest is automatic, and counts down', async () => {
    const train = useTrain()
    train.begin()
    train.complete()
    expect(train.phase).toBe('rest')
    expect(train.idx).toBe(0)
    expect(train.remaining).toBe(120)
    await wait(30_000)
    expect(train.remaining).toBe(90)
    expect(train.restDone).toBe(false)
    await wait(90_000)
    expect(train.remaining).toBe(0)
    expect(train.restDone).toBe(true)
  })

  it('goes straight to the next set when the rest is manual, and rests on request', () => {
    const app = useApp()
    app.s.plan.auto = false
    const train = useTrain()
    train.begin()
    train.complete()
    expect(train.phase).toBe('set')
    expect(train.idx).toBe(1)
    train.startRest()
    expect(train.phase).toBe('rest')
  })

  it('moves to the next set after the rest and back with prev', () => {
    const train = useTrain()
    train.begin()
    train.complete()
    train.next()
    expect(train.phase).toBe('set')
    expect(train.idx).toBe(1)
    train.prev()
    expect(train.idx).toBe(0)
    train.prev()
    expect(train.idx).toBe(0)
  })

  it('finishes after the last set and says so', () => {
    const app = useApp()
    const toast = useToast()
    app.s.plan.sets = [{ pct: 60, reps: 5 }, { pct: 80, reps: 2 }]
    const train = useTrain()
    train.begin()
    train.complete()
    train.next()
    expect(train.last).toBe(true)
    train.complete()
    expect(train.phase).toBe('off')
    expect(train.active).toBe(false)
    expect(toast.current?.text).toBe('Entrenamiento terminado')
  })

  it('ending early stays quiet', () => {
    const toast = useToast()
    const train = useTrain()
    train.begin()
    train.finish(false)
    expect(train.phase).toBe('off')
    expect(toast.current).toBeNull()
  })

  it('adds and removes rest time, never below zero', async () => {
    const train = useTrain()
    train.begin()
    train.complete()
    train.adjust(15)
    expect(train.remaining).toBe(135)
    expect(train.restTotal).toBe(135)
    train.adjust(-15)
    train.adjust(-1000)
    expect(train.remaining).toBe(0)
  })

  it('a bump after the rest ended starts a fresh countdown', async () => {
    const train = useTrain()
    train.begin()
    train.complete()
    await wait(121_000)
    expect(train.restDone).toBe(true)
    train.adjust(-15)
    expect(train.restDone).toBe(true)
    train.adjust(15)
    expect(train.restDone).toBe(false)
    expect(train.remaining).toBe(15)
  })

  it('sounds the alert once when the rest ends', async () => {
    const train = useTrain()
    train.begin()
    train.complete()
    await wait(119_000)
    expect(alertDone).not.toHaveBeenCalled()
    await wait(5_000)
    await wait(30_000)
    expect(alertDone).toHaveBeenCalledTimes(1)
  })

  it('stays silent when the sound is off', async () => {
    const app = useApp()
    app.s.plan.sound = false
    const train = useTrain()
    train.begin()
    train.complete()
    await wait(125_000)
    expect(train.restDone).toBe(true)
    expect(alertDone).not.toHaveBeenCalled()
  })
})
