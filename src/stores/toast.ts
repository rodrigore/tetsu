import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  text: string
  undo?: () => void
}

/** One short message at a time, optionally with an "undo" action. */
export const useToast = defineStore('toast', () => {
  const current = ref<Toast | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined
  let n = 0

  function show(text: string, undo?: () => void, ms = 6000) {
    clearTimeout(timer)
    current.value = { id: ++n, text, undo }
    timer = setTimeout(dismiss, ms)
  }
  function dismiss() {
    clearTimeout(timer)
    current.value = null
  }
  function undo() {
    const t = current.value
    dismiss()
    t?.undo?.()
  }
  return { current, show, dismiss, undo }
})
