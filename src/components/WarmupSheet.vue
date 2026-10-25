<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { diffPlates } from '../core/delta'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import { useLoad } from '../core/useLoad'
import { fromKg } from '../core/units'
import { solve } from '../core/solver'
import { warmupSteps } from '../core/warmup'
import Sheet from './Sheet.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const { plates, barKg, targetKg, plateInfo } = useLoad(() => false)

const base = computed(() => ({ barKg: barKg.value, collarKg: app.s.collarKg, plates: plates.value, mode: app.s.round }))
const steps = computed(() => {
  const warm = warmupSteps(targetKg.value, app.s.warm, base.value)
  const work = solve({ ...base.value, targetKg: targetKg.value })
  const all = [
    ...warm.map((s) => ({
      label: s.pct === null ? t.value.emptyBarStep : `${fmt(s.pct, app.s.lang)} %`,
      result: s.result,
      work: false,
    })),
    { label: `${t.value.workSet} · ${fmt(app.s.pct, app.s.lang)} %`, result: work, work: true },
  ]
  return all.map((s, i) => {
    const ids = s.result.perSide.map((p) => p.id)
    const prev = i > 0 ? all[i - 1]!.result.perSide.map((p) => p.id) : null
    const d = prev ? diffPlates(prev, ids) : null
    const chips: { id: string; n: number }[] = []
    for (const id of ids) {
      const c = chips.find((x) => x.id === id)
      if (c) c.n++
      else chips.push({ id, n: 1 })
    }
    return { ...s, chips, delta: d, weight: fmt(fromKg(s.result.totalKg, app.s.unit), app.s.lang) }
  })
})
const U = computed(() => app.s.unit.toUpperCase())
const name = (id: string) => {
  const i = plateInfo(id)
  return `${i.label} ${i.unit}`
}
</script>

<template>
  <Sheet :title="t.warmupTitle" @close="ui.open.warmup = false">
    <p class="hint">{{ t.warmupHint }}</p>
    <ol>
      <li v-for="(s, i) in steps" :key="i" :class="{ work: s.work }">
        <div class="top">
          <span class="lbl">{{ s.label }}</span>
          <span class="w display">{{ s.weight }}<small>{{ U }}</small></span>
        </div>
        <div class="chips">
          <span v-if="s.chips.length === 0" class="c muted">{{ t.emptyBar }}</span>
          <span v-for="c in s.chips" :key="c.id" class="c">{{ c.n > 1 ? c.n + '×' : '' }}{{ name(c.id) }}</span>
        </div>
        <div v-if="s.delta && (s.delta.add.length || s.delta.remove.length)" class="delta">
          <span v-for="c in s.delta.remove" :key="'r' + c.id" class="rm">− {{ c.count > 1 ? c.count + '×' : '' }}{{ name(c.id) }}</span>
          <span v-for="c in s.delta.add" :key="'a' + c.id" class="ad">+ {{ c.count > 1 ? c.count + '×' : '' }}{{ name(c.id) }}</span>
        </div>
      </li>
    </ol>
  </Sheet>
</template>

<style scoped>
.hint {
  margin: 0;
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--muted);
  line-height: 1.3;
}
ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
li {
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
li.work {
  border-color: var(--accent);
}
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.lbl {
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--muted);
}
li.work .lbl {
  color: var(--accent);
}
.w {
  font-size: 30px;
  line-height: 1;
}
.w small {
  margin-left: 4px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  color: var(--muted);
}
.chips,
.delta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.c {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  border: 1px solid var(--line);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.04em;
}
.muted {
  color: var(--muted);
}
.delta span {
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
}
.rm {
  color: var(--muted);
}
.ad {
  color: var(--accent);
}
</style>
