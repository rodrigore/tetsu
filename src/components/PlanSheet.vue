<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { useTrain } from '../stores/train'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { activeTemplate, clampPct, clampReps, MAX_SETS, nextSet, PLAN_TEMPLATES, planSteps } from '../core/plan'
import { testSound } from '../core/beep'
import { useLoad } from '../core/useLoad'
import { fromKg, parseNumber } from '../core/units'
import { selectAll } from '../core/selectAll'
import RestInput from './RestInput.vue'
import Sheet from './Sheet.vue'

const app = useApp()
const ui = useUi()
const train = useTrain()
const t = computed(() => messages(app.s.lang))
const { plates, barKg, mode } = useLoad(() => false)

const sets = computed(() => app.s.plan.sets)
const active = computed(() => activeTemplate(sets.value))
const steps = computed(() =>
  planSteps(app.lift.kg, sets.value, { barKg: barKg.value, collarKg: app.s.collarKg, plates: plates.value, mode: mode.value }),
)
const summary = computed(() => steps.value.map((s) => fmt(fromKg(s.result.totalKg, app.s.unit), app.s.lang)).join(' · '))
const U = computed(() => app.s.unit.toUpperCase())

const pickTemplate = (id: string) => {
  app.s.plan.sets = PLAN_TEMPLATES.find((x) => x.id === id)!.sets.map((x) => ({ ...x }))
}
const setPct = (i: number, e: Event) => {
  const el = e.target as HTMLInputElement
  const n = parseNumber(el.value)
  if (n !== null) app.s.plan.sets[i]!.pct = clampPct(n)
  el.value = fmt(app.s.plan.sets[i]!.pct, app.s.lang)
}
const setReps = (i: number, e: Event) => {
  const el = e.target as HTMLInputElement
  const n = parseNumber(el.value)
  if (n !== null) app.s.plan.sets[i]!.reps = clampReps(n)
  el.value = String(app.s.plan.sets[i]!.reps)
}
const add = () => {
  if (sets.value.length < MAX_SETS) app.s.plan.sets.push(nextSet(sets.value))
}
const remove = (i: number) => app.s.plan.sets.splice(i, 1)
</script>

<template>
  <Sheet :title="t.trainTitle" @close="ui.open.plan = false">
    <div class="head">
      <div><span class="k">{{ t.trLift }}</span><div class="lift">{{ app.liftName(app.lift) }}</div></div>
      <div class="pr"><span class="k">PR</span><div class="lift">{{ fmt(fromKg(app.lift.kg, app.s.unit), app.s.lang) }} <small>{{ U }}</small></div></div>
    </div>

    <div>
      <span class="k">{{ t.trTemplate }}</span>
      <div class="chips hide-scroll">
        <button v-for="tp in PLAN_TEMPLATES" :key="tp.id" type="button" :class="{ on: active === tp.id }" :aria-pressed="active === tp.id" @click="pickTemplate(tp.id)">{{ tp.name[app.s.lang] }}</button>
      </div>
    </div>

    <div>
      <span class="k">{{ t.trSets }}</span>
      <ol>
        <li v-for="(s, i) in sets" :key="i">
          <span class="n">{{ i + 1 }}</span>
          <label class="f"><input type="text" inputmode="decimal" :value="fmt(s.pct, app.s.lang)" :aria-label="`${t.trPctAria} ${i + 1}`" @focus="selectAll" @change="setPct(i, $event)" /><small>%</small></label>
          <span class="x">×</span>
          <label class="f"><input type="text" inputmode="numeric" :value="s.reps" :aria-label="`${t.trRepsAria} ${i + 1}`" @focus="selectAll" @change="setReps(i, $event)" /><small>reps</small></label>
          <button type="button" class="rm" :aria-label="`${t.trRemoveAria} ${i + 1}`" @click="remove(i)">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </li>
      </ol>
      <p v-if="!sets.length" class="empty">{{ t.trEmpty }}</p>
      <div class="foot">
        <span class="sum">{{ summary }} {{ summary ? U : '' }}</span>
        <button type="button" class="add" :disabled="sets.length >= MAX_SETS" @click="add">{{ t.trAddSet }}</button>
      </div>
    </div>

    <div class="rest">
      <div class="lbl">{{ t.trRest }}<small>{{ t.trRestHint }}</small></div>
      <RestInput v-model="app.s.plan.rest" />
    </div>
    <div class="tg">
      <span>{{ t.trAuto }}</span>
      <button type="button" role="switch" :aria-checked="app.s.plan.auto" :aria-label="t.trAuto" :class="{ on: app.s.plan.auto }" @click="app.s.plan.auto = !app.s.plan.auto"><i /></button>
    </div>
    <div class="tg">
      <span>{{ t.trSound }}</span>
      <button type="button" role="switch" :aria-checked="app.s.plan.sound" :aria-label="t.trSound" :class="{ on: app.s.plan.sound }" @click="app.s.plan.sound = !app.s.plan.sound"><i /></button>
    </div>

<div class="snd">
      <button type="button" class="test" @click="testSound()">{{ t.trTestSound }}</button>
      <p>{{ t.trSilentHint }}</p>
    </div>

    <button type="button" class="go" :disabled="!sets.length" @click="train.begin()">{{ t.trStart }}</button>
  </Sheet>
</template>

<style scoped>
.k { display: block; font-size: calc(13px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); }
.head { display: flex; justify-content: space-between; align-items: flex-end; }
.lift { margin-top: 2px; font-size: calc(24px * var(--ts)); font-weight: 700; letter-spacing: 0.04em; }
.lift small { font-size: calc(15px * var(--ts)); color: var(--accent); }
.pr { text-align: right; }
.chips { margin-top: 8px; display: flex; gap: 8px; overflow-x: auto; }
.chips button { flex: none; height: 44px; padding: 0 16px; border-radius: 22px; border: 1px solid var(--line2); background: transparent; color: var(--muted); font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; }
.chips button.on { border-color: var(--accent); color: var(--text); }
ol { list-style: none; margin: 8px 0 0; padding: 0; }
li { display: grid; grid-template-columns: 24px 1fr 20px 1fr 44px; align-items: center; column-gap: 8px; min-height: 64px; border-top: 1px solid var(--line); }
li:last-child { border-bottom: 1px solid var(--line); }
.n { font-size: calc(20px * var(--ts)); font-weight: 700; color: var(--muted); }
.x { text-align: center; font-size: calc(20px * var(--ts)); font-weight: 700; color: var(--muted); }
.f { height: 44px; border-radius: 8px; border: 1px solid var(--line2); background: var(--surface); display: flex; align-items: center; justify-content: center; gap: 2px; }
.f input { width: 56px; min-width: 0; padding: 0; text-align: right; background: transparent; border: 0; outline: none; color: var(--text); font-size: calc(24px * var(--ts)); font-weight: 700; }
.f small { width: 30px; font-size: calc(14px * var(--ts)); color: var(--muted); }
.rm { width: 44px; height: 44px; border: 0; background: transparent; color: var(--muted); display: flex; align-items: center; justify-content: center; }
.empty { margin: 12px 0 0; color: var(--muted); font-size: calc(16px * var(--ts)); }
.foot { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.sum { font-size: calc(16px * var(--ts)); font-weight: 600; letter-spacing: 0.04em; color: var(--muted); }
.add { flex: none; height: 44px; padding: 0 4px; border: 0; background: transparent; color: var(--accent); font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; }
.add:disabled { color: var(--muted); }
.rest { display: flex; flex-direction: column; gap: 10px; padding: 12px 0; border-top: 1px solid var(--line); }
.lbl { font-size: calc(19px * var(--ts)); font-weight: 600; letter-spacing: 0.04em; line-height: 1.15; }
.lbl small { display: block; font-size: calc(14px * var(--ts)); font-weight: 500; color: var(--muted); letter-spacing: 0.02em; }
.snd { display: flex; flex-direction: column; gap: 8px; }
.snd p { margin: 0; font-size: calc(14px * var(--ts)); color: var(--muted); letter-spacing: 0.02em; line-height: 1.3; }
.test { align-self: flex-start; height: 44px; padding: 0 18px; border-radius: 22px; border: 1px solid var(--accent); background: transparent; color: var(--accent); font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.08em; }
.tg { display: flex; align-items: center; justify-content: space-between; min-height: 48px; font-size: calc(18px * var(--ts)); font-weight: 600; letter-spacing: 0.04em; }
.tg button { flex: none; width: 52px; height: 30px; padding: 0; border-radius: 15px; border: 1px solid var(--line2); background: var(--surface); position: relative; }
.tg button i { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 11px; background: var(--muted); transition: transform 0.15s; }
.tg button.on { background: var(--accent); border-color: var(--accent); }
.tg button.on i { background: var(--on); transform: translateX(22px); }
.go { height: 56px; border-radius: 10px; border: 0; background: var(--accent); color: var(--on); font-size: calc(19px * var(--ts)); font-weight: 700; letter-spacing: 0.08em; }
.go:disabled { opacity: 0.4; }
</style>
