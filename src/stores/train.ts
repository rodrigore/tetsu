import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { alertDone, unlockAudio } from '../core/beep'
import { messages } from '../core/i18n'
import { remainingSec } from '../core/rest'
import { useApp } from './app'
import { useToast } from './toast'
import { useUi } from './ui'

/** A training session over the plan: one set at a time, with a rest timer between them. Not saved. */
export const useTrain = defineStore('train', () => {
  const app = useApp()
  const ui = useUi()
  const toast = useToast()

  const phase = ref<'off' | 'set' | 'rest'>('off')
  const idx = ref(0)
  const restEnd = ref(0)
  const restTotal = ref(0)
  const now = ref(Date.now())
  const restDone = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  const active = computed(() => phase.value !== 'off')
  const count = computed(() => app.s.plan.sets.length)
  const last = computed(() => idx.value >= count.value - 1)
  const remaining = computed(() => remainingSec(restEnd.value, now.value))

  /** Moves the clock on and, the first time the rest hits zero, sounds the alert. */
  function tick() {
    now.value = Date.now()
    if (phase.value === 'rest' && !restDone.value && remainingSec(restEnd.value, now.value) === 0) {
      restDone.value = true
      if (app.s.plan.sound) alertDone()
    }
  }
  watch(phase, (p) => {
    clearInterval(timer)
    timer = undefined
    if (p === 'rest') {
      tick()
      timer = setInterval(tick, 250)
    }
  }, { flush: 'sync' })
  // Back from a locked screen the interval may have been paused: catch up at once.
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => phase.value === 'rest' && tick())

  function begin() {
    if (count.value === 0) return
    unlockAudio()
    idx.value = 0
    phase.value = 'set'
    ui.open.plan = false
  }
  function startRest() {
    unlockAudio()
    tick()
    restTotal.value = app.s.plan.rest
    restEnd.value = now.value + restTotal.value * 1000
    restDone.value = false
    phase.value = 'rest'
  }
  function finish(announce = true) {
    phase.value = 'off'
    idx.value = 0
    if (announce) toast.show(messages(app.s.lang).trWorkoutDone)
  }
  /** The set is done: finish after the last one, otherwise rest (or go straight on). */
  function complete() {
    unlockAudio()
    if (last.value) return finish()
    if (app.s.plan.auto) return startRest()
    idx.value++
  }
  function next() {
    if (last.value) return finish()
    idx.value++
    phase.value = 'set'
  }
  function prev() {
    if (idx.value > 0) idx.value--
    phase.value = 'set'
  }
  /** +/- seconds on the running rest; once it has ended a bump starts a new countdown. */
  function adjust(sec: number) {
    tick()
    if (restDone.value) {
      if (sec <= 0) return
      restTotal.value = sec
      restEnd.value = now.value + sec * 1000
      restDone.value = false
      return
    }
    restEnd.value = Math.max(now.value, restEnd.value + sec * 1000)
    restTotal.value = Math.max(restTotal.value, remainingSec(restEnd.value, now.value))
  }

  return { phase, idx, active, count, last, remaining, restTotal, restDone, begin, startRest, complete, next, prev, adjust, finish }
})
