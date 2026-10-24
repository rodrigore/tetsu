<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { fmtW } from '../core/format'
import { messages } from '../core/i18n'
import { useUi } from '../stores/ui'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const text = (b: { value: number; unit: string }) => `${fmtW(b.value, app.s.lang)} ${b.unit.toUpperCase()}`
</script>

<template>
  <div class="row">
    <button
      v-for="(b, i) in app.s.bars"
      :key="b.value + b.unit"
      type="button"
      class="pill"
      :class="{ on: i === app.s.barIndex }"
      :aria-pressed="i === app.s.barIndex"
      :aria-label="`${t.barAria} ${text(b)}`"
      @click="app.s.barIndex = i"
    >
      <span class="display num">{{ text(b) }}</span>
      <span class="cap">{{ t.bar }}</span>
    </button>
    <button type="button" class="gear" :aria-label="t.settingsAria" @click="ui.open.settings = true">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M19 7h1M4 17h1M11 17h9" stroke="currentColor" stroke-width="2" stroke-linecap="square" fill="none" /><circle cx="16" cy="7" r="2.5" stroke="currentColor" stroke-width="2" fill="none" /><circle cx="8" cy="17" r="2.5" stroke="currentColor" stroke-width="2" fill="none" /></svg>
    </button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 8px;
}
.gear {
  flex: none;
  margin-left: auto;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pill {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  height: 48px;
  padding: 0 14px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
}
.pill.on {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}
.num {
  font-size: 22px;
  letter-spacing: 0.04em;
  line-height: 1;
}
.cap {
  font-size: calc(12px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.16em;
  line-height: 1;
}
</style>
