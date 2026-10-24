import { onBeforeUnmount, watch, type Ref } from 'vue'

/** Keeps the screen on while `active` is true. Silently does nothing where unsupported. */
export function useWakeLock(active: Ref<boolean>) {
  let lock: WakeLockSentinel | null = null

  const release = async () => {
    try {
      await lock?.release()
    } catch {
      /* already released */
    }
    lock = null
  }
  const acquire = async () => {
    if (!active.value || lock || document.visibilityState !== 'visible') return
    try {
      lock = (await navigator.wakeLock?.request('screen')) ?? null
      lock?.addEventListener('release', () => (lock = null))
    } catch {
      /* denied or unsupported */
    }
  }

  watch(active, (on) => (on ? acquire() : release()), { immediate: true })
  const onVis = () => acquire()
  document.addEventListener('visibilitychange', onVis)
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVis)
    release()
  })
}
