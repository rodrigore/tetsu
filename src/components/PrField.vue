<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useApp } from '../stores/app'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { fromKg, parseNumber, toKg } from '../core/units'

const app = useApp()
const t = computed(() => messages(app.s.lang))
const shown = computed(() => fmt(fromKg(app.lift.kg, app.s.unit), app.s.lang))

// While typing, keep the raw text so "62," or "62." is not rewritten under the cursor.
const raw = ref<string | null>(null)
watch(() => [app.s.liftId, app.s.unit, app.s.lang], () => (raw.value = null))

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  raw.value = v
  const n = parseNumber(v)
  if (n !== null && n <= 1000) app.lift.kg = toKg(n, app.s.unit)
}
</script>

<template>
  <div>
    <label for="pr-input" class="lbl">{{ app.liftName(app.lift) }} · PR</label>
    <div class="line">
      <input
        id="pr-input"
        class="display field"
        type="text"
        inputmode="decimal"
        :value="raw ?? shown"
        :aria-label="t.prAria"
        @input="onInput"
        @blur="raw = null"
      />
      <span class="unit">{{ app.s.unit.toUpperCase() }}</span>
    </div>
  </div>
</template>

<style scoped>
.lbl {
  display: block;
  font-size: calc(13px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--muted);
  line-height: 1;
}
.line {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1;
}
.field {
  width: 124px;
  height: 46px;
  padding: 0;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--line2);
  border-radius: 0;
  color: var(--text);
  font-size: 36px;
  line-height: 1;
  outline: none;
}
.unit {
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
}
</style>
