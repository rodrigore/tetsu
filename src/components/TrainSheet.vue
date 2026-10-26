<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../stores/app'
import { useTrain } from '../stores/train'
import { diffPlates } from '../core/delta'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { idsOf, planSteps } from '../core/plan'
import { clock, REST_STEP, ringFraction } from '../core/rest'
import { fromKg } from '../core/units'
import { looksOf, usedOf, useLoad } from '../core/useLoad'
import SoundField from './SoundField.vue'
import TimeWheelSheet from './TimeWheelSheet.vue'
import BarView from './BarView.vue'
import PlateChips from './PlateChips.vue'

const app = useApp()
const train = useTrain()
const t = computed(() => messages(app.s.lang))
const { plates, barKg, mode, plateInfo, accent } = useLoad(() => false)

const steps = computed(() =>
  planSteps(app.lift.kg, app.s.plan.sets, { barKg: barKg.value, collarKg: app.s.collarKg, plates: plates.value, mode: mode.value }),
)
const i = computed(() => Math.min(train.idx, Math.max(0, steps.value.length - 1)))
const cur = computed(() => steps.value[i.value])
const nxt = computed(() => steps.value[i.value + 1])
const prv = computed(() => (i.value > 0 ? steps.value[i.value - 1] : undefined))

const f = (v: number) => fmt(v, app.s.lang)
const U = computed(() => app.s.unit.toUpperCase())
const kg = (v: number) => f(fromKg(v, app.s.unit))

const used = computed(() => usedOf(cur.value?.result.perSide ?? [], app.s.lang))
const looks = computed(() => looksOf(used.value, accent.value, app.s.olympic, false))
const chips = computed(() => {
  const g: { id: string; label: string; unit: string; count: number }[] = []
  for (const p of used.value) {
    const x = g.find((c) => c.id === p.def.id)
    if (x) x.count++
    else g.push({ id: p.def.id, label: p.label, unit: p.unit.toUpperCase(), count: 1 })
  }
  return g
})

const sideLine = computed(() => {
  const s = cur.value?.result.loadedSideKg ?? 0
  const other = app.s.unit === 'kg' ? 'lb' : 'kg'
  return `${f(fromKg(s, app.s.unit))} ${U.value} / ${f(fromKg(s, other))} ${other.toUpperCase()}`
})

const label = (c: { id: string; count: number }) => {
  const p = plateInfo(c.id)
  return `${c.count > 1 ? c.count + '×' : ''}${p.label} ${p.unit}`
}
const diffFrom = (a?: typeof cur.value, b?: typeof cur.value) => (a && b ? diffPlates(idsOf(a.result), idsOf(b.result)) : null)
const dPrev = computed(() => diffFrom(prv.value, cur.value))
const dNext = computed(() => diffFrom(cur.value, nxt.value))
const same = (d: ReturnType<typeof diffFrom>) => !!d && !d.add.length && !d.remove.length

const ring = 2 * Math.PI * 118
const offset = computed(() => ring * (1 - ringFraction(train.remaining, train.restTotal)))
const editing = ref(false)
const edit = ref(60)
const openEdit = () => {
  edit.value = Math.max(5, train.remaining || train.restTotal)
  editing.value = true
}
const mainLabel = computed(() => (train.last ? t.value.trDoneLast : app.s.plan.auto ? t.value.trDoneRest : t.value.trDoneNext))
</script>

<template>
  <section v-if="cur" class="train hide-scroll" role="dialog" :aria-label="t.trainTitle">
    <div class="inner">
      <!-- the set -->
      <template v-if="train.phase === 'set'">
        <header>
          <div><div class="k">{{ t.trSet }}</div><div class="display h">{{ i + 1 }} {{ t.ofN }} {{ steps.length }}</div></div>
          <button type="button" class="out" @click="train.finish(false)">{{ t.trFinish }}</button>
        </header>
        <div class="segs" aria-hidden="true"><span v-for="(_, n) in steps" :key="n" :class="{ d: n < i, n: n === i }" /></div>

        <div class="top">
          <div>
            <div class="k">{{ app.liftName(app.lift) }}</div>
            <div class="w"><span class="num">{{ kg(cur.result.totalKg) }}</span><span class="u">{{ U }}</span></div>
          </div>
          <div class="reps"><div class="k">{{ t.trReps }}</div><div class="r">×{{ cur.reps }}</div></div>
        </div>
        <div class="line"><span>{{ f(cur.pct) }} % {{ t.ofPr }}</span><span>{{ t.perSideShort.toUpperCase() }} {{ sideLine }}</span></div>

        <BarView class="barview" :used="used" :looks="looks" />

        <div class="chg" :class="{ idle: !dPrev || same(dPrev) }">
          <div class="k">{{ dPrev ? t.trFromPrev : t.trFirstSet }}</div>
          <div v-if="dPrev && !same(dPrev)" class="pills">
            <span v-for="c in dPrev.remove" :key="'r' + c.id" class="pill rm">− {{ label(c) }}</span>
            <span v-for="c in dPrev.add" :key="'a' + c.id" class="pill ad">+ {{ label(c) }}</span>
          </div>
          <div v-else-if="dPrev" class="none">{{ t.noChange }}</div>
        </div>
        <PlateChips :chips="chips" :empty="used.length === 0" :empty-text="t.emptyBar" />

        <div class="sp" />
        <p class="info">{{ app.s.plan.auto ? t.trRestInfoAuto : t.trRestInfoManual }} <b>{{ clock(app.s.plan.rest) }}</b></p>
        <div v-if="nxt" class="nx"><span>{{ t.trNext }} · {{ f(nxt.pct) }} % × {{ nxt.reps }}</span><b>{{ kg(nxt.result.totalKg) }} {{ U }}</b></div>
        <div class="btns">
          <button type="button" class="sq" :disabled="i === 0" :aria-label="t.trPrevAria" @click="train.prev()">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button v-if="!app.s.plan.auto && !train.last" type="button" class="sec" @click="train.startRest()">{{ t.trRestNow }}</button>
          <button type="button" class="main" @click="train.complete()">{{ mainLabel }}</button>
        </div>
      </template>

      <!-- the rest -->
      <template v-else>
        <header>
          <div><div class="k">{{ t.trRestTitle }}</div><div class="display h">{{ t.trAfter }} {{ i + 1 }}</div></div>
          <button type="button" class="out" @click="train.finish(false)">{{ t.trFinish }}</button>
        </header>
        <div class="segs" aria-hidden="true"><span v-for="(_, n) in steps" :key="n" :class="{ d: n <= i }" /></div>

        <div class="ringbox">
          <svg aria-hidden="true" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="118" fill="none" stroke="var(--track)" stroke-width="10" />
            <circle cx="130" cy="130" r="118" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" :stroke-dasharray="ring" :stroke-dashoffset="offset" />
          </svg>
          <div class="mid">
            <div class="time" role="timer" :aria-label="`${t.trTimerAria}: ${clock(train.remaining)}`">{{ clock(train.remaining) }}</div>
            <div class="k">{{ t.ofN }} {{ clock(train.restTotal) }}</div>
          </div>
        </div>

        <div class="adj">
          <button type="button" @click="train.adjust(-REST_STEP)">{{ t.trMinus15 }}</button>
          <button type="button" @click="train.adjust(REST_STEP)">{{ t.trPlus15 }}</button>
          <button type="button" :class="{ on: editing }" @click="openEdit">{{ t.trAdjust }}</button>
          <button type="button" class="strong" @click="train.next()">{{ t.trSkip }}</button>
        </div>
        <TimeWheelSheet v-if="editing" v-model="edit" :title="t.trAdjust" :cta="t.trApply" @update:model-value="train.restart($event)" @close="editing = false" />

        <div v-if="nxt" class="card">
          <div class="k">{{ t.trNext }} · {{ t.trSet }} {{ i + 2 }}</div>
          <div class="row"><span class="p">{{ f(nxt.pct) }} % × {{ nxt.reps }}</span><span class="v">{{ kg(nxt.result.totalKg) }} <small>{{ U }}</small></span></div>
          <div v-if="dNext && !same(dNext)" class="pills">
            <span v-for="c in dNext.remove" :key="'r' + c.id" class="pill rm">− {{ label(c) }}</span>
            <span v-for="c in dNext.add" :key="'a' + c.id" class="pill ad">+ {{ label(c) }}</span>
          </div>
          <div v-else class="none">{{ t.noChange }}</div>
          <p>{{ t.trRestChanges }}</p>
        </div>

        <div class="tg">
          <span>{{ t.trSoundOn }}</span>
          <button type="button" role="switch" :aria-checked="app.s.plan.sound" :aria-label="t.trSoundOn" :class="{ on: app.s.plan.sound }" @click="app.s.plan.sound = !app.s.plan.sound"><i /></button>
        </div>
        <SoundField />
        <div class="sp" />
        <button type="button" class="main full" :class="{ pulse: train.restDone }" @click="train.next()">{{ t.trGoSet }} {{ i + 2 }}</button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.train { position: fixed; inset: 0; z-index: 12; overflow-y: auto; background: var(--bg); }
.inner { max-width: 480px; min-height: 100%; margin: 0 auto; box-sizing: border-box; padding: max(20px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 14px; }
header { display: flex; align-items: center; justify-content: space-between; }
.k { font-size: calc(13px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); }
.h { font-size: 34px; line-height: 1; letter-spacing: 0.04em; }
.out { height: 44px; padding: 0 16px; border-radius: 6px; border: 1px solid var(--line2); background: transparent; color: var(--text); font-size: calc(15px * var(--ts)); font-weight: 700; letter-spacing: 0.1em; }
.segs { display: flex; gap: 6px; }
.segs span { flex: 1; height: 6px; border-radius: 3px; background: var(--track); }
.segs .d { background: var(--muted); }
.segs .n { background: var(--accent); }
.top { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.w { display: flex; align-items: flex-end; gap: 10px; margin-top: 10px; }
.num { font-family: 'Anton', sans-serif; font-size: calc(88px * var(--ts)); line-height: 0.85; }
.u { padding-bottom: 2px; font-size: calc(30px * var(--ts)); font-weight: 700; color: var(--accent); line-height: 1; }
.reps { text-align: right; }
.r { font-size: calc(60px * var(--ts)); font-weight: 700; line-height: 0.9; color: var(--accent); }
.line { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: calc(17px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; color: var(--muted); }
.barview { --pad: 24px; flex: none; min-height: 150px; }
.chg { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--accent); background: var(--surface); }
.chg.idle { border-color: var(--line); }
.pills { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
.pill { display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 17px; border: 1px solid var(--line2); font-size: calc(19px * var(--ts)); font-weight: 700; letter-spacing: 0.05em; }
.pill.ad { color: var(--accent); border-color: var(--accent); }
.pill.rm { color: var(--muted); }
.none { margin-top: 6px; font-size: calc(16px * var(--ts)); font-weight: 600; letter-spacing: 0.06em; color: var(--muted); }
.sp { flex: 1; }
.nx { display: flex; justify-content: space-between; align-items: center; font-size: calc(17px * var(--ts)); font-weight: 600; letter-spacing: 0.04em; color: var(--muted); }
.nx b { color: var(--text); }
.btns { display: flex; gap: 10px; }
.sq { flex: none; width: 64px; height: 60px; border-radius: 10px; border: 1px solid var(--line2); background: transparent; color: var(--text); display: flex; align-items: center; justify-content: center; }
.sq:disabled { opacity: 0.35; }
.sec { flex: none; padding: 0 16px; height: 60px; border-radius: 10px; border: 1px solid var(--accent); background: transparent; color: var(--accent); font-size: calc(16px * var(--ts)); font-weight: 700; letter-spacing: 0.08em; }
.main { flex: 1; min-width: 0; height: 60px; border-radius: 10px; border: 0; background: var(--accent); color: var(--on); font-size: calc(19px * var(--ts)); font-weight: 700; letter-spacing: 0.08em; }
.main.full { flex: none; width: 100%; }
.main.pulse { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.7; } }
@media (prefers-reduced-motion: reduce) { .main.pulse { animation: none; } }
.ringbox { position: relative; width: 260px; height: 260px; margin: 8px auto 0; }
.ringbox svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.mid { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.time { font-family: 'Anton', sans-serif; font-size: 92px; line-height: 0.9; }
.adj { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.adj .on { border-color: var(--accent); color: var(--text); }
.info { margin: 0; font-size: calc(15px * var(--ts)); font-weight: 500; letter-spacing: 0.02em; color: var(--muted); }
.info b { color: var(--text); letter-spacing: 0.06em; }
.adj button { height: 44px; padding: 0 16px; border-radius: 22px; border: 1px solid var(--line2); background: transparent; color: var(--muted); font-size: calc(17px * var(--ts)); font-weight: 700; letter-spacing: 0.04em; }
.adj .strong { color: var(--text); }
.card { padding: 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); }
.row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 4px; }
.p { font-size: calc(19px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; }
.v { font-family: 'Anton', sans-serif; font-size: calc(34px * var(--ts)); line-height: 1; }
.v small { font-family: 'Barlow Condensed', sans-serif; font-size: calc(17px * var(--ts)); font-weight: 700; color: var(--accent); }
.card p { margin: 8px 0 0; font-size: calc(14px * var(--ts)); color: var(--muted); }
.tg { display: flex; align-items: center; justify-content: space-between; min-height: 48px; font-size: calc(18px * var(--ts)); font-weight: 600; letter-spacing: 0.04em; }
.tg button { flex: none; width: 52px; height: 30px; padding: 0; border-radius: 15px; border: 1px solid var(--line2); background: var(--surface); position: relative; }
.tg button i { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 11px; background: var(--muted); transition: transform 0.15s; }
.tg button.on { background: var(--accent); border-color: var(--accent); }
.tg button.on i { background: var(--on); transform: translateX(22px); }
</style>
