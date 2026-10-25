<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { fmt, fmtW } from '../core/format'
import { messages } from '../core/i18n'
import { addPlate, countOf, manualTotalKg, removeLast } from '../core/manual'
import { useLoad, looksOf, usedOf } from '../core/useLoad'
import { fromKg, toKg } from '../core/units'
import { plateLook } from '../core/plateView'
import BarView from './BarView.vue'
import Sheet from './Sheet.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const { plates, barKg, targetKg, accent } = useLoad(() => false)

const stack = ref<string[]>([])
const owned = computed(() =>
  plates.value
    .filter((p) => p.pairs > 0)
    .sort((a, b) => (a.unit === b.unit ? toKg(b.value, b.unit) - toKg(a.value, a.unit) : a.unit === 'lb' ? -1 : 1)),
)
const totalKg = computed(() => manualTotalKg(stack.value, plates.value, barKg.value, app.s.collarKg))
const diff = computed(() => fromKg(totalKg.value - targetKg.value, app.s.unit))

const used = computed(() =>
  usedOf(stack.value.map((id) => plates.value.find((p) => p.id === id)!).filter(Boolean), app.s.lang),
)
const looks = computed(() => looksOf(used.value, accent.value, app.s.olympic, false))

const f = (v: number) => fmt(v, app.s.lang)
const U = computed(() => app.s.unit.toUpperCase())
const other = computed(() => (app.s.unit === 'kg' ? 'lb' : 'kg'))
const full = (p: { id: string; pairs: number }) => countOf(stack.value, p.id) >= p.pairs
const stripe = (p: { value: number; unit: 'kg' | 'lb'; id: string }) =>
  plateLook(p.value, p.unit, { accent: accent.value, olympic: app.s.olympic && !p.id.startsWith('c:'), light: false }).bg
</script>

<template>
  <Sheet :title="t.manualTitle" @close="ui.open.manual = false">
    <div>
      <div class="k">{{ t.manualTotal }}</div>
      <div class="big"><span class="display n">{{ f(fromKg(totalKg, app.s.unit)) }}</span><span class="u">{{ U }}</span><span class="o">{{ f(fromKg(totalKg, other)) }} {{ other.toUpperCase() }}</span></div>
      <div class="goal"><span>{{ t.target }} {{ f(fromKg(targetKg, app.s.unit)) }} {{ U }}</span><b :class="{ acc: Math.abs(diff) >= 0.05 }">{{ Math.abs(diff) < 0.05 ? t.exact : (diff > 0 ? '+' : '−') + f(Math.abs(diff)) }}</b></div>
    </div>

    <BarView class="barview" :used="used" :looks="looks" />

    <div>
      <div class="k">{{ t.manualHint }}</div>
      <div class="grid">
        <button
          v-for="p in owned"
          :key="p.id"
          type="button"
          class="pb"
          :class="{ max: full(p) }"
          :aria-label="`${fmtW(p.value, app.s.lang)} ${p.unit.toUpperCase()}${full(p) ? ', ' + t.manualMaxAria : ''}`"
          :aria-disabled="full(p)"
          @click="stack = addPlate(stack, p)"
        >
          <i :style="{ background: stripe(p) }" />
          <span class="display">{{ fmtW(p.value, app.s.lang) }}</span><small>{{ p.unit.toUpperCase() }}</small>
          <span v-if="countOf(stack, p.id)" class="b">{{ countOf(stack, p.id) }}</span>
        </button>
      </div>
    </div>

    <div class="acts">
      <button type="button" :disabled="!stack.length" @click="stack = removeLast(stack)">{{ t.manualUndo }}</button>
      <button type="button" :disabled="!stack.length" @click="stack = []">{{ t.manualClear }}</button>
    </div>
    <p class="note">{{ t.manualInv }}</p>
  </Sheet>
</template>

<style scoped>
.k { font-size: calc(13px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); }
.big { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
.n { font-size: 72px; line-height: 0.95; }
.u { font-size: calc(26px * var(--ts)); font-weight: 700; color: var(--accent); }
.o { font-size: calc(18px * var(--ts)); font-weight: 600; color: var(--muted); }
.goal { margin-top: 8px; display: inline-flex; gap: 8px; padding: 6px 12px; border-radius: 16px; border: 1px solid var(--line); font-size: calc(17px * var(--ts)); font-weight: 700; letter-spacing: 0.04em; }
.goal span { color: var(--muted); font-weight: 600; }
.acc { color: var(--accent); }
.barview { --pad: 24px; flex: none; min-height: 150px; }
.grid { margin-top: 14px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px 10px; }
.pb { position: relative; height: 60px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--text); display: flex; align-items: center; justify-content: center; gap: 4px; }
.pb .display { font-size: calc(24px * var(--ts)); }
.pb small { font-size: calc(12px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; color: var(--muted); }
.pb i { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; border-radius: 10px 0 0 10px; }
.pb .b { position: absolute; top: -8px; right: -6px; min-width: 22px; height: 22px; box-sizing: border-box; padding: 0 5px; border-radius: 11px; background: var(--accent); color: var(--on); font-size: 15px; font-weight: 700; line-height: 22px; text-align: center; }
.pb.max { opacity: 0.45; }
.acts { display: flex; gap: 10px; }
.acts button { flex: 1; height: 52px; border-radius: 10px; border: 1px solid var(--line2); background: transparent; color: var(--text); font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; }
.acts button:disabled { color: var(--muted); border-color: var(--line); opacity: 0.6; }
.note { margin: -8px 0 0; text-align: center; font-size: calc(14px * var(--ts)); color: var(--muted); }
</style>
