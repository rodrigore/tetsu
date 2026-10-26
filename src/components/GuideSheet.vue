<script setup lang="ts">
import { computed } from 'vue'
import { useApp, type Preset } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { fmtW } from '../core/format'
import { PLAN_TEMPLATES, activeTemplate } from '../core/plan'
import RestField from './RestField.vue'
import SoundField from './SoundField.vue'
import LayoutPreview from './LayoutPreview.vue'
import LiftsEditor from './LiftsEditor.vue'
import PercentList from './PercentList.vue'
import Section from './Section.vue'
import Seg from './Seg.vue'
import AddRow from './AddRow.vue'
import { applyProfile } from '../core/profiles'
import { toKg, type Unit } from '../core/units'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const step = computed(() => ui.open.guide)
const STEPS = 8
const titles = computed(() => [t.value.g1, t.value.gv, t.value.g2, t.value.g3, t.value.gw, t.value.gt, t.value.gx, t.value.g4])
const hints = computed(() => [t.value.g1h, t.value.gvh, t.value.g2h, t.value.g3h, t.value.gwh, t.value.gth, t.value.gxh, t.value.g4h])
const tour = computed(() => [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  title: t.value[`tour${n}t` as keyof typeof t.value],
  body: t.value[`tour${n}b` as keyof typeof t.value],
})))
const activePlan = computed(() => activeTemplate(app.s.plan.sets))
const pickPlan = (id: string) => {
  app.s.plan.sets = PLAN_TEMPLATES.find((x) => x.id === id)!.sets.map((x) => ({ ...x }))
}
const yesNo = computed(() => [{ value: true, label: t.value.yes }, { value: false, label: t.value.no }])

const presetDesc = computed(() => {
  const id = app.s.presetId
  return id === 'gym' ? t.value.presetGymDesc : id === 'box' ? t.value.presetBoxDesc : ''
})
const presetLabel = (p: Preset) => (typeof p.name === 'string' ? p.name : p.name[app.s.lang])
function applyPreset(p: Preset) {
  Object.assign(app.s, JSON.parse(JSON.stringify(p.vals)))
  app.s.presetId = p.id
  // BOX also means bumpers in kilos and a 20 kg bar, so the plates match the place.
  if (p.id === 'box') applyProfile(app.s, 'box')
}

function close() {
  app.s.guideDone = true
  ui.open.guide = 0
}
function next() {
  if (step.value >= STEPS) close()
  else ui.open.guide++
}
function openInventory() {
  close()
  ui.open.inventory = true
}
function addBar(value: number, unit: Unit) {
  const kg = toKg(value, unit)
  if (kg < 2 || kg > 40 || app.s.bars.length >= 4) return false
  if (app.s.bars.some((b) => b.value === value && b.unit === unit)) return true
  app.s.bars.push({ value, unit })
  return true
}
const barText = (b: { value: number; unit: string }) => `${fmtW(b.value, app.s.lang)} ${b.unit.toUpperCase()}`
</script>

<template>
  <section class="guide" role="dialog" :aria-label="titles[step - 1]">
    <div class="inner">
      <div class="top">
        <span class="count">{{ step }} / {{ STEPS }}</span>
        <button type="button" class="skip" @click="close">{{ t.skip }}</button>
      </div>
      <div>
        <h2 class="display">{{ titles[step - 1] }}</h2>
        <p>{{ hints[step - 1] }}</p>
      </div>

      <template v-if="step === 1">
        <Section :title="t.language">
          <Seg v-model="app.s.lang" :options="[{ value: 'en', label: 'ENGLISH' }, { value: 'es', label: 'ESPAÑOL' }]" />
        </Section>
        <Section :title="t.prUnit">
          <Seg v-model="app.s.unit" :options="[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]" />
        </Section>
      </template>

      <template v-else-if="step === 2">
        <LayoutPreview />
        <Section :title="t.presets" :hint="t.guidePresetsHint">
          <div class="presets">
            <button
              v-for="p in app.s.presets"
              :key="p.id"
              type="button"
              :class="{ on: app.s.presetId === p.id }"
              :aria-pressed="app.s.presetId === p.id"
              @click="applyPreset(p)"
            >{{ presetLabel(p) }}</button>
          </div>
          <div v-if="presetDesc" class="pdesc">{{ presetDesc }}</div>
        </Section>
        <Section :title="t.layTitle">
          <Seg
            :model-value="app.s.layout.id"
            :options="[{ value: 'simple', label: t.laySimple }, { value: 'complete', label: t.layComplete }, { value: 'onehand', label: t.layOne }]"
            @update:model-value="app.s.layout.id = $event"
          />
        </Section>
      </template>

      <template v-else-if="step === 3">
        <Section :title="t.barsTitle">
          <Seg
            v-model="app.s.barIndex"
            :options="app.s.bars.map((b, i) => ({ value: i, label: barText(b) }))"
          />
          <p class="barhint">{{ t.guideBarHint }}</p>
          <AddRow :aria="t.addBarAria" :add-label="t.add" :error="t.barErr" :default-unit="app.s.unit" :on-add="addBar" />
        </Section>
        <Section :title="t.collars">
          <Seg
            v-model="app.s.collarKg"
            :options="[0, 0.25, 2.5].map((v) => ({ value: v, label: v === 0 ? t.none : fmtW(v, app.s.lang) + ' KG' }))"
          />
        </Section>
      </template>

      <template v-else-if="step === 4">
        <LiftsEditor />
      </template>

      <template v-else-if="step === 5">
        <Section :title="t.warmSettings" :hint="t.warmHint">
          <PercentList v-model="app.s.warm" :min="1" :max="99" :max-items="5" />
        </Section>
      </template>

      <template v-else-if="step === 6">
        <Section :title="t.gtTemplate">
          <div class="presets">
            <button v-for="tp in PLAN_TEMPLATES" :key="tp.id" type="button" :class="{ on: activePlan === tp.id }" :aria-pressed="activePlan === tp.id" @click="pickPlan(tp.id)">{{ tp.name[app.s.lang] }}</button>
          </div>
        </Section>
        <Section :title="t.gtRest">
          <RestField v-model="app.s.plan.rest" />
        </Section>
        <Section :title="t.trAuto">
          <Seg v-model="app.s.plan.auto" :options="yesNo" />
        </Section>
        <Section :title="t.trSound">
          <Seg v-model="app.s.plan.sound" :options="yesNo" />
          <SoundField />
        </Section>
        <Section :title="t.prFormula" :hint="t.gtFormulaHint">
          <Seg v-model="app.s.e1rm" :options="[{ value: 'epley', label: 'EPLEY' }, { value: 'brzycki', label: 'BRZYCKI' }]" />
        </Section>
      </template>

      <template v-else-if="step === 7">
        <ul class="tour">
          <li v-for="(it, i) in tour" :key="i"><b>{{ it.title }}</b><span>{{ it.body }}</span></li>
        </ul>
      </template>

      <template v-else>
        <button type="button" class="wide" @click="openInventory">{{ t.guideInvBtn }}</button>
      </template>

      <div class="nav">
        <button v-if="step > 1" type="button" class="back" @click="ui.open.guide = step - 1">{{ t.back }}</button>
        <button type="button" class="next" @click="next">{{ step >= STEPS ? t.finish : t.next }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.barhint {
  margin: 0;
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--muted);
  line-height: 1.3;
}
.guide {
  position: fixed;
  inset: 0;
  z-index: 20;
  overflow-y: auto;
  background: var(--bg);
}
.inner {
  max-width: 480px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: max(20px, env(safe-area-inset-top)) 24px max(22px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.count {
  font-size: calc(14px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
}
.skip {
  height: 44px;
  background: transparent;
  border: 0;
  color: var(--muted);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.12em;
}
h2 {
  margin: 0;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.05;
}
p {
  margin: 12px 0 0;
  font-size: calc(18px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.03em;
  color: var(--muted);
  line-height: 1.3;
}
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.presets button {
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
.pdesc {
  padding: 10px 12px;
  border-left: 3px solid var(--accent);
  background: var(--surface);
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.3;
}
.presets button.on {
  background: var(--accent);
  color: var(--on);
  border-color: var(--accent);
}
.tour {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.tour li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
}
.tour li:last-child {
  border-bottom: 1px solid var(--line);
}
.tour b {
  font-size: calc(18px * var(--ts));
  letter-spacing: 0.08em;
  color: var(--accent);
}
.tour span {
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--muted);
  line-height: 1.3;
}
.wide {
  width: 100%;
  height: 56px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line2);
  font-size: calc(18px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.12em;
}
.nav {
  margin-top: auto;
  display: flex;
  gap: 10px;
}
.nav button {
  height: 52px;
  border-radius: 6px;
  font-size: calc(17px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.12em;
}
.back {
  flex: 1;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line2);
}
.next {
  flex: 2;
  background: var(--accent);
  color: var(--on);
  border: 0;
}
</style>
