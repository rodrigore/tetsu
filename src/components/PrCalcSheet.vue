<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { useToast } from '../stores/toast'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { estimate1RM, roundPr, validReps } from '../core/oneRm'
import { selectAll } from '../core/selectAll'
import { fromKg, parseNumber, toKg } from '../core/units'
import Sheet from './Sheet.vue'
import Seg from './Seg.vue'

const app = useApp()
const ui = useUi()
const toast = useToast()
const t = computed(() => messages(app.s.lang))
const U = computed(() => app.s.unit.toUpperCase())

const weight = ref('')
const reps = ref('')

const weightKg = computed(() => {
  const n = parseNumber(weight.value)
  return n === null ? null : toKg(n, app.s.unit)
})
const repsN = computed(() => (/^\d+$/.test(reps.value.trim()) ? Number(reps.value) : NaN))

const est = computed(() => {
  if (weightKg.value === null || !validReps(repsN.value)) return null
  const v = estimate1RM(weightKg.value, repsN.value, app.s.e1rm)
  return v === null ? null : roundPr(v)
})
const touched = computed(() => weight.value.trim() !== '' || reps.value.trim() !== '')

/** How far above (+) or below (−) the saved PR, in the PR unit. */
const gain = computed(() => (est.value === null ? 0 : roundPr(fromKg(est.value - app.lift.kg, app.s.unit))))
const better = computed(() => est.value !== null && est.value > app.lift.kg + 0.04)

const f = (v: number) => fmt(v, app.s.lang)
const other = computed(() => (app.s.unit === 'kg' ? 'lb' : 'kg'))
const formulas = [
  { value: 'epley' as const, label: 'EPLEY' },
  { value: 'brzycki' as const, label: 'BRZYCKI' },
]

function save(share: boolean) {
  if (est.value === null) return
  const prev = app.lift.example ? null : app.lift.kg
  const card = { newKg: est.value, prevKg: prev, source: { kg: weightKg.value!, reps: repsN.value } }
  app.lift.kg = est.value
  app.lift.example = false
  ui.open.pr = false
  if (share) {
    ui.prCard = card
    ui.open.share = true
  } else {
    toast.show(t.value.prSaved)
  }
}
</script>

<template>
  <Sheet :title="t.prCalc" @close="ui.open.pr = false">
    <p class="lift">{{ app.liftName(app.lift) }}</p>

    <div class="inputs">
      <label>
        <span class="k">{{ t.prWeight }}</span>
        <span class="box"><input v-model="weight" class="display" type="text" inputmode="decimal" autocomplete="off" :aria-label="t.prWeight" @focus="selectAll" /><b>{{ U }}</b></span>
      </label>
      <label>
        <span class="k">{{ t.prReps }}</span>
        <span class="box"><input v-model="reps" class="display" type="text" inputmode="numeric" autocomplete="off" :aria-label="t.prReps" @focus="selectAll" /></span>
      </label>
    </div>

    <div>
      <span class="k">{{ t.prFormula }}</span>
      <Seg :model-value="app.s.e1rm" :options="formulas" class="seg" @update:model-value="app.s.e1rm = $event" />
    </div>

    <div class="result" :class="{ empty: est === null }" aria-live="polite">
      <template v-if="est !== null">
        <span class="k">{{ t.prEstimated }}</span>
        <div class="big"><span class="display n">{{ f(fromKg(est, app.s.unit)) }}</span><span class="u">{{ U }}</span></div>
        <div class="alt">{{ f(fromKg(est, other)) }} {{ other.toUpperCase() }}</div>
        <div class="badge" :class="{ up: better }">
          <template v-if="Math.abs(gain) < 0.05">{{ t.prSame }}</template>
          <template v-else>{{ gain > 0 ? '+' : '−' }}{{ f(Math.abs(gain)) }} {{ U }} {{ gain > 0 ? t.prAbove : t.prBelow }} ({{ f(fromKg(app.lift.kg, app.s.unit)) }} {{ U }})</template>
        </div>
      </template>
      <p v-else class="err">{{ touched ? t.prRepsErr : t.prNote }}</p>
    </div>
    <p v-if="est !== null" class="note">{{ t.prNote }}</p>

    <div class="acts">
      <button type="button" class="ghost" :disabled="est === null" @click="save(false)">{{ t.prSaveBtn }}</button>
      <button v-if="better" type="button" class="main" @click="save(true)">{{ t.prSaveShare }}</button>
    </div>
  </Sheet>
</template>

<style scoped>
.lift { margin: 0; font-size: calc(16px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); }
.k { display: block; font-size: calc(13px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 8px; }
.inputs { display: flex; gap: 12px; }
.inputs label { flex: 1; min-width: 0; }
.box { display: flex; align-items: baseline; gap: 8px; border-bottom: 2px solid var(--line2); }
.box input { width: 100%; min-width: 0; height: 56px; padding: 0; background: transparent; border: 0; color: var(--text); font-size: 40px; outline: none; }
.box b { font-size: calc(16px * var(--ts)); letter-spacing: 0.1em; color: var(--accent); }
.result { padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); min-height: 150px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.result .k { margin: 0; }
.big { display: flex; align-items: baseline; gap: 10px; line-height: 1; }
.n { font-size: 64px; line-height: 1; }
.u { font-size: calc(24px * var(--ts)); font-weight: 700; color: var(--accent); }
.alt { font-size: calc(18px * var(--ts)); font-weight: 600; color: var(--muted); }
.badge { margin-top: 8px; align-self: flex-start; padding: 6px 12px; border-radius: 16px; border: 1px solid var(--line); font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.04em; color: var(--muted); }
.badge.up { color: var(--accent); border-color: var(--accent); }
.err { margin: 0; font-size: calc(16px * var(--ts)); font-weight: 500; letter-spacing: 0.04em; color: var(--muted); line-height: 1.3; }
.note { margin: -10px 0 0; font-size: calc(14px * var(--ts)); color: var(--muted); letter-spacing: 0.02em; }
.acts { display: flex; flex-direction: column; gap: 10px; }
.acts button { height: 54px; border-radius: 10px; font-size: calc(18px * var(--ts)); font-weight: 700; letter-spacing: 0.08em; }
.ghost { background: transparent; color: var(--text); border: 1px solid var(--line2); }
.main { background: var(--accent); color: var(--on); border: 0; }
.acts button:disabled { color: var(--muted); border-color: var(--line); opacity: 0.6; }
</style>
