<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useApp } from '../stores/app'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { fromKg, parseNumber } from '../core/units'

const app = useApp()
const t = computed(() => messages(app.s.lang))

// Weight the percentage stands for, always visible whatever the style or mode.
const targetText = computed(
  () => `${fmt(fromKg((app.lift.kg * app.s.pct) / 100, app.s.unit), app.s.lang)} ${app.s.unit.toUpperCase()}`,
)

const raw = ref<string | null>(null)
watch(() => app.s.lang, () => (raw.value = null))

const set = (v: number) => {
  app.s.pct = Math.max(1, Math.min(200, Math.round(v * 10) / 10))
  raw.value = null
}
function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  raw.value = v
  const n = parseNumber(v)
  if (n !== null && n <= 200) app.s.pct = n
}
</script>

<template>
  <div>
    <div class="head">
      <div class="value">
        <input
          class="display field"
          type="text"
          inputmode="decimal"
          :value="raw ?? fmt(app.s.pct, app.s.lang)"
          :aria-label="t.pctAria"
          @input="onInput"
          @blur="raw = null"
        />
        <span class="display sign">%</span>
        <span class="of">{{ t.ofPr }}</span>
      </div>
      <div class="steps">
        <button type="button" :aria-label="t.pctDownAria" @click="set(app.s.pct - app.s.pstep)">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" fill="none" /></svg>
        </button>
        <button type="button" :aria-label="t.pctUpAria" @click="set(app.s.pct + app.s.pstep)">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M9 3v12" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" fill="none" /></svg>
        </button>
      </div>
    </div>
    <div class="tgt" aria-live="polite">= {{ targetText }}</div>
    <input
      class="dial"
      type="range"
      min="30"
      max="105"
      :step="app.s.pstep"
      :value="app.s.pct"
      :aria-label="t.pctAria"
      @input="set(Number(($event.target as HTMLInputElement).value))"
    />
    <div v-if="app.s.look === 'full'" class="quick">
      <button
        v-for="q in app.s.quick"
        :key="q"
        type="button"
        :class="{ on: q === app.s.pct }"
        :aria-pressed="q === app.s.pct"
        @click="set(q)"
      >
        {{ fmt(q, app.s.lang) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.value {
  display: flex;
  align-items: center;
  gap: 4px;
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
.sign {
  font-size: 28px;
  color: var(--accent);
}
.of {
  margin-left: 6px;
  white-space: nowrap;
  font-size: calc(14px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--muted);
}
.steps {
  display: flex;
  gap: 8px;
  width: 132px;
  flex: none;
}
.steps button {
  flex: 1;
  min-width: 0;
  height: 46px;
  padding: 0;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tgt {
  margin-top: 6px;
  font-size: calc(20px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  line-height: 1;
}
.dial {
  width: 100%;
  margin: 4px 0 0;
  height: 44px;
  accent-color: var(--accent);
}
.quick {
  margin-top: 6px;
  display: flex;
  gap: 6px;
}
@media (orientation: landscape) and (max-height: 500px) {
  .quick {
    display: none;
  }
  .field {
    width: 84px;
    font-size: 32px;
  }
  .of {
    display: none;
  }
  .steps {
    width: 104px;
  }
}
.quick button {
  flex: 1;
  height: 40px;
  border-radius: 6px;
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
}
.quick button.on {
  background: var(--accent);
  color: var(--on);
  border-color: var(--accent);
}
</style>
