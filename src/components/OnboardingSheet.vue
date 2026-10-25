<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { applyProfile, profileOf, type ProfileId } from '../core/profiles'
import { parseNumber, toKg, type Unit } from '../core/units'
import { selectAll } from '../core/selectAll'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))

const step = ref(0)
const place = ref<ProfileId>('gym')
const unit = ref<Unit>(profileOf('gym').unit)
const best = ref('')

const places = computed(() => [
  { id: 'gym' as const, title: t.value.pfGym, sub: t.value.pfGymD },
  { id: 'box' as const, title: t.value.pfBox, sub: t.value.pfBoxD },
  { id: 'kilos' as const, title: t.value.pfKilos, sub: t.value.pfKilosD },
  { id: 'home' as const, title: t.value.pfHome, sub: t.value.pfHomeD },
])
function pick(id: ProfileId) {
  place.value = id
  unit.value = profileOf(id).unit
}

const parsed = computed(() => parseNumber(best.value))
const bestOk = computed(() => parsed.value === null || (parsed.value > 0 && parsed.value <= 1000))

function close() {
  app.s.guideDone = true
  ui.open.onboarding = false
}
/** Leaving early keeps the sample data and shows the checklist so nothing is lost. */
function skip() {
  close()
}
function finish() {
  applyProfile(app.s, place.value)
  app.s.unit = unit.value
  if (parsed.value !== null && bestOk.value) {
    app.lift.kg = toKg(parsed.value, unit.value)
    app.lift.example = false
  }
  app.s.steps.where = true
  close()
  if (place.value === 'home') ui.open.inventory = true
}
const next = () => (step.value < 2 ? step.value++ : finish())
</script>

<template>
  <section class="ob" role="dialog" :aria-label="t[step === 0 ? 'obQ1' : step === 1 ? 'obQ2' : 'obQ3']">
    <div class="inner">
      <div class="top">
        <div class="bars" aria-hidden="true"><span v-for="i in 3" :key="i" :class="{ on: i <= step + 1 }" /></div>
        <button type="button" class="skip" @click="skip">{{ t.obSkip }}</button>
      </div>

      <div>
        <div class="k">{{ t.obQ }} {{ step + 1 }} {{ t.obOf }} 3</div>
        <h2 class="display">{{ step === 0 ? t.obQ1 : step === 1 ? t.obQ2 : t.obQ3 }}</h2>
        <p class="lead">{{ step === 0 ? t.obQ1h : step === 1 ? t.obQ2h : t.obQ3h }}</p>
      </div>

      <div v-if="step === 0" class="opts" role="radiogroup" :aria-label="t.obQ1">
        <button v-for="p in places" :key="p.id" type="button" role="radio" class="opt" :class="{ on: place === p.id }" :aria-checked="place === p.id" @click="pick(p.id)">
          <span><span class="tt">{{ p.title }}</span><span class="ss">{{ p.sub }}</span></span>
          <i class="dot" aria-hidden="true" />
        </button>
      </div>

      <div v-else-if="step === 1" class="opts" role="radiogroup" :aria-label="t.obQ2">
        <button v-for="u in (['kg', 'lb'] as const)" :key="u" type="button" role="radio" class="opt" :class="{ on: unit === u }" :aria-checked="unit === u" @click="unit = u">
          <span><span class="tt">{{ u === 'kg' ? 'KILOS' : app.s.lang === 'es' ? 'LIBRAS' : 'POUNDS' }}</span><span class="ss">{{ u.toUpperCase() }}</span></span>
          <i class="dot" aria-hidden="true" />
        </button>
      </div>

      <div v-else class="best">
        <label class="k" for="ob-best">{{ app.liftName(app.lift) }} · PR</label>
        <div class="line">
          <input id="ob-best" v-model="best" class="display" type="text" inputmode="decimal" :placeholder="t.obQ3ph" @focus="selectAll" />
          <span class="u">{{ unit.toUpperCase() }}</span>
        </div>
        <p v-if="!bestOk" class="bad" role="alert">{{ t.obBad }}</p>
      </div>

      <div class="grow" />
      <p v-if="step === 0" class="note">{{ t.obNote }}</p>
      <div class="foot">
        <button v-if="step > 0" type="button" class="back" @click="step--">{{ t.obBack }}</button>
        <button type="button" class="go" :disabled="step === 2 && !bestOk" @click="next">{{ step < 2 ? t.obNext : t.obFinish }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ob {
  position: fixed;
  inset: 0;
  z-index: 20;
  overflow-y: auto;
  background: var(--bg);
}
.inner {
  min-height: 100%;
  box-sizing: border-box;
  max-width: 480px;
  margin: 0 auto;
  padding: max(20px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.top {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bars {
  flex: 1;
  display: flex;
  gap: 6px;
}
.bars span {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--line);
}
.bars span.on {
  background: var(--accent);
}
.skip {
  height: 44px;
  padding: 0 6px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
.k {
  font-size: calc(13px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--muted);
}
h2 {
  margin: 6px 0 0;
  font-size: 38px;
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.05;
}
.lead {
  margin: 10px 0 0;
  font-size: calc(18px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.3;
}
.opts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.opt {
  min-height: 68px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--line2);
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}
.opt.on {
  border: 2px solid var(--accent);
  padding: 9px 15px;
  background: var(--surface);
}
.tt {
  display: block;
  font-size: calc(23px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
}
.ss {
  display: block;
  margin-top: 2px;
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  color: var(--muted);
}
.dot {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--line2);
  box-sizing: border-box;
}
.on .dot {
  border-color: var(--accent);
  background: radial-gradient(var(--accent) 0 40%, transparent 45%);
}
.best .line {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.best input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 76px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--line2);
  background: var(--surface);
  color: var(--text);
  font-size: 56px;
}
.u {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}
.bad {
  margin: 8px 0 0;
  color: var(--accent);
  font-size: calc(16px * var(--ts));
  font-weight: 600;
}
.grow {
  flex: 1;
}
.note {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  line-height: 1.3;
}
.foot {
  display: flex;
  gap: 10px;
}
.back {
  flex: none;
  height: 56px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1px solid var(--line2);
  background: transparent;
  color: var(--text);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.go {
  flex: 1;
  height: 56px;
  border: 0;
  border-radius: 10px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(20px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.go:disabled {
  opacity: 0.4;
}
</style>
