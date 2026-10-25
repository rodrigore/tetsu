import { useUi } from '../stores/ui'

/** Puts the cursor in the PR field; when the layout hides it, opens "Mi marca" instead. */
export function focusPr(): void {
  const el = document.getElementById('pr-input') as HTMLInputElement | null
  if (el) el.focus()
  else useUi().open.lifts = true
}
