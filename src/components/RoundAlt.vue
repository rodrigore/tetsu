<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { roundOptions } from '../core/rounding'
import { useLoad } from '../core/useLoad'
import { fromKg } from '../core/units'
import type { RoundMode } from '../core/solver'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const { plates, barKg, targetKg, result } = useLoad(() => false)

const options = computed(() => roundOptions({ targetKg: targetKg.value, barKg: barKg.value, collarKg: app.s.collarKg, plates: plates.value }))
const f = (v: number) => fmt(v, app.s.lang)
const U = computed(() => app.s.unit.toUpperCase())
const name = (m: RoundMode) => (m === 'down' ? t.value.optDown : m === 'up' ? t.value.optUp : t.value.optNear)

const cards = computed(() =>
  options.value.map((o) => {
    const d = fromKg(o.result.diffKg, app.s.unit)
    return {
      mode: o.mode,
      total: f(fromKg(o.result.totalKg, app.s.unit)),
      diff: `${d > 0 ? '+' : d < 0 ? '−' : ''}${f(Math.abs(d))}`,
      side: `${f(fromKg(o.result.loadedSideKg, app.s.unit))} ${t.value.perSideShort}`,
      on: Math.abs(o.result.totalKg - result.value.totalKg) < 0.001,
    }
  }),
)
const pick = (m: RoundMode) => (ui.roundPick = m)
</script>

<template>
  <div v-if="cards.length" class="alt">
    <div class="k">{{ t.roundPick }}</div>
    <div class="row" role="radiogroup" :aria-label="t.roundPick">
      <button v-for="c in cards" :key="c.mode" type="button" role="radio" :aria-checked="c.on" :class="{ on: c.on }" @click="pick(c.mode)">
        <span class="t">{{ name(c.mode) }}</span>
        <span class="v display">{{ c.total }}<small>{{ U }}</small></span>
        <span class="d">{{ c.diff }}</span>
        <span class="s">{{ c.side }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.alt { display: flex; flex-direction: column; gap: 8px; }
.k { font-size: calc(12px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); }
.row { display: flex; gap: 8px; }
button { flex: 1; min-width: 0; box-sizing: border-box; padding: 10px 8px; border-radius: 10px; background: transparent; color: var(--text); border: 1px solid var(--line); text-align: left; display: flex; flex-direction: column; gap: 2px; }
button.on { border: 2px solid var(--accent); padding: 9px 7px; background: var(--surface); }
.t { font-size: calc(12px * var(--ts)); font-weight: 600; letter-spacing: 0.1em; color: var(--muted); }
button.on .t, button.on .d { color: var(--accent); }
.v { font-size: calc(28px * var(--ts)); line-height: 1.05; }
.v small { margin-left: 3px; font-family: 'Barlow Condensed', sans-serif; font-size: calc(13px * var(--ts)); font-weight: 700; color: var(--muted); }
.d { font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.04em; color: var(--muted); }
.s { font-size: calc(13px * var(--ts)); font-weight: 500; color: var(--muted); }
</style>
