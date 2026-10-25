import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import type { PrInfo } from '../core/shareCard'
import type { RoundMode } from '../core/solver'

/** Which full-screen sheets are open. Not persisted. */
export const useUi = defineStore('ui', () => {
  const open = reactive({ settings: false, inventory: false, lifts: false, warmup: false, share: false, pr: false, manual: false, plan: false, guide: 0, onboarding: false })
  const tab = reactive({ settings: 'display' as 'display' | 'bar' | 'general' })
  /** Rounding picked on the main screen for the current target. Not saved; resets when the target changes. */
  /** Advanced block in settings, folded by default. */
  const advanced = ref(false)
  /** First-steps card shows every step, not just the next one. */
  const stepsOpen = ref(false)
  const roundPick = ref<RoundMode | null>(null)
  /** When set, the share sheet shows the new-PR card for this record. */
  const prCard = ref<PrInfo | null>(null)
  return { open, tab, advanced, stepsOpen, roundPick, prCard }
})
