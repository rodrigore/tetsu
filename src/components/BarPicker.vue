<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'

const app = useApp()
const t = computed(() => messages(app.s.lang))
const text = (b: { value: number; unit: string }) => `${fmt(b.value, app.s.lang)} ${b.unit.toUpperCase()}`
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
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 8px;
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
