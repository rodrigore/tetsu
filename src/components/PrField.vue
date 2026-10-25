<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useApp } from '../stores/app'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { useUi } from '../stores/ui'
import { fromKg, parseNumber, toKg } from '../core/units'
import { selectAll } from '../core/selectAll'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const shown = computed(() => fmt(fromKg(app.lift.kg, app.s.unit), app.s.lang))

// While typing, keep the raw text so "62," or "62." is not rewritten under the cursor.
const raw = ref<string | null>(null)
watch(() => [app.s.liftId, app.s.unit, app.s.lang], () => (raw.value = null))

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  raw.value = v
  const n = parseNumber(v)
  if (n !== null && n <= 1000) {
    app.lift.kg = toKg(n, app.s.unit)
    app.lift.example = false
  }
}
</script>

<template>
  <div class="pr">
   <div>
    <label for="pr-input" class="lbl">{{ app.liftName(app.lift) }} · PR<span v-if="app.lift.example" class="ex">{{ t.example }}</span></label>
    <div class="line">
      <input
        id="pr-input"
        class="display field"
        type="text"
        inputmode="decimal"
        :value="raw ?? shown"
        :aria-label="t.prAria"
        @input="onInput"
        @focus="selectAll"
        @blur="raw = null"
      />
      <span class="unit">{{ app.s.unit.toUpperCase() }}</span>
    </div>
   </div>
    <button type="button" class="edit" @click="ui.open.lifts = true">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="miter" fill="none" /></svg>
      {{ t.edit }}
    </button>
  </div>
</template>

<style scoped>
.pr {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.edit {
  flex: none;
  width: 132px;
  height: 46px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
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
.lbl {
  white-space: nowrap;
}
.ex {
  margin-left: 8px;
  padding: 2px 6px;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--accent);
  font-size: 0.85em;
  letter-spacing: 0.1em;
}
@media (orientation: landscape) and (max-height: 500px) {
  .field {
    width: 96px;
    font-size: 32px;
  }
  .edit {
    width: 104px;
  }
}
.unit {
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
}
</style>
