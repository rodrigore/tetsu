import { onBeforeUnmount, ref } from 'vue'

/** Reactive CSS media query. */
export function useMq(query: string) {
  const mq = window.matchMedia(query)
  const matches = ref(mq.matches)
  const on = (e: MediaQueryListEvent) => (matches.value = e.matches)
  mq.addEventListener('change', on)
  onBeforeUnmount(() => mq.removeEventListener('change', on))
  return matches
}

export const LANDSCAPE_PHONE = '(orientation: landscape) and (max-height: 500px)'
