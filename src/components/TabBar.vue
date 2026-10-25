<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { diffPlates } from '../core/delta'
import { messages } from '../core/i18n'
import type { UsedPlate } from '../core/useLoad'

const props = defineProps<{ used: UsedPlate[] }>()
const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))

const ids = computed(() => props.used.map((p) => p.def.id))
const same = computed(() => {
  if (!app.s.onBar) return false
  const d = diffPlates(app.s.onBar, ids.value)
  return d.add.length === 0 && d.remove.length === 0
})
const mark = () => (app.s.onBar = [...ids.value])
</script>

<template>
  <div class="dock">
    <button type="button" class="main" :disabled="same" @click="mark">{{ same ? t.loadedDone : t.loadedBtn }}</button>
    <nav :aria-label="t.navAria">
      <button type="button" class="on" aria-current="page">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M6 7v10M18 7v10" /></svg>
        {{ t.tabLoad }}
      </button>
      <button type="button" @click="ui.open.plan = true">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
        {{ t.tabTrain }}
      </button>
      <button type="button" @click="ui.open.lifts = true">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        {{ t.tabMark }}
      </button>
      <button type="button" @click="ui.open.settings = true">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>
        {{ t.tabSettings }}
      </button>
    </nav>
  </div>
</template>

<style scoped>
.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background: var(--bg);
  border-top: 1px solid var(--line);
}
.main,
nav {
  max-width: 480px;
  margin: 0 auto;
}
.main {
  display: block;
  width: calc(100% - 48px);
  height: 56px;
  margin-top: 10px;
  border: 0;
  border-radius: 10px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(19px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.main:disabled {
  background: var(--surface);
  color: var(--muted);
  border: 1px solid var(--line);
}
nav {
  display: flex;
  padding: 0 12px max(8px, env(safe-area-inset-bottom));
}
nav button {
  flex: 1;
  min-width: 0;
  height: 62px;
  border: 0;
  background: transparent;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: calc(12px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
nav button.on {
  color: var(--accent);
}
/* Phone on its side: no room for a dock, the header keeps its own settings button. */
@media (orientation: landscape) and (max-height: 500px) {
  .dock {
    display: none;
  }
}
</style>
