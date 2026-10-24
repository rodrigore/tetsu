import { registerSW } from 'virtual:pwa-register'

/**
 * Keeps the installed app current. In "autoUpdate" mode the page reloads on its own once a new
 * version has taken over; here we also look for one each time the app comes back to the foreground
 * (iOS keeps the app suspended instead of restarting it) and once an hour while it stays open.
 */
export function registerUpdates() {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) void registration.update()
      }
      document.addEventListener('visibilitychange', check)
      setInterval(check, 60 * 60 * 1000)
    },
  })
}
