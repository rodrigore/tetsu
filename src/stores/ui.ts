import { defineStore } from 'pinia'
import { reactive } from 'vue'

/** Which full-screen sheets are open. Not persisted. */
export const useUi = defineStore('ui', () => {
  const open = reactive({ settings: false, inventory: false, lifts: false, warmup: false, share: false, guide: 0 })
  const tab = reactive({ settings: 'display' as 'display' | 'bar' | 'general' })
  return { open, tab }
})
