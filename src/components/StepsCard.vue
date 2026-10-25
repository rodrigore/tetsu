<script setup lang="ts">
import { computed, watch } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { useToast } from '../stores/toast'
import { messages } from '../core/i18n'

const app = useApp()
const ui = useUi()
const toast = useToast()
const t = computed(() => messages(app.s.lang))

const standalone =
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches

interface Step {
  id: string
  title: string
  sub?: string
  done: boolean
  go?: string
  act?: () => void
}
const steps = computed<Step[]>(() => [
  { id: 'where', title: t.value.stWhere, done: app.s.steps.where, go: t.value.stGoWhere, act: () => (ui.open.inventory = true) },
  { id: 'plates', title: t.value.stPlates, done: app.s.guideDone },
  {
    id: 'pr', title: t.value.stPr, sub: t.value.stPrH, done: app.s.lifts.some((l) => !l.example), go: t.value.stGoPr,
    act: () => (document.getElementById('pr-input') as HTMLInputElement | null)?.focus(),
  },
  { id: 'warm', title: t.value.stWarm, sub: t.value.stWarmH, done: app.s.steps.warm, go: t.value.stGoWarm, act: () => { ui.open.warmup = true; app.s.steps.warm = true } },
  {
    id: 'install', title: t.value.stInst, sub: t.value.stInstH, done: app.s.steps.install || standalone, go: t.value.stGoInst,
    act: () => { toast.show(t.value.installBody, undefined, 12000); app.s.steps.install = true },
  },
])
const count = computed(() => steps.value.filter((s) => s.done).length)
const open = computed({ get: () => ui.stepsOpen, set: (v) => (ui.stepsOpen = v) })
// Collapsed, only the next pending step shows so the result stays in view.
const shown = computed(() => (open.value ? steps.value : steps.value.filter((s) => !s.done).slice(0, 1)))
const visible = computed(() => app.s.guideDone && !app.s.steps.hidden)

watch(count, (n) => {
  if (n === steps.value.length && !app.s.steps.hidden) {
    app.s.steps.hidden = true
    toast.show(t.value.stDone)
  }
})
</script>

<template>
  <section v-if="visible" class="card" :aria-label="t.stTitle">
    <header>
      <div>
        <div class="k">{{ t.stTitle }} · {{ count }} {{ t.stOf }} {{ steps.length }}</div>
        <div class="prog" aria-hidden="true"><span v-for="(s, i) in steps" :key="s.id" :class="{ on: i < count }" /></div>
      </div>
      <button type="button" class="hide" @click="app.s.steps.hidden = true">{{ t.stHide }}</button>
    </header>
    <ul>
      <li v-for="s in shown" :key="s.id" :class="{ done: s.done }">
        <span class="ck" aria-hidden="true">
          <svg v-if="s.done" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10" /></svg>
        </span>
        <span class="tx"><span class="tt">{{ s.title }}</span><span v-if="s.sub && !s.done" class="ss">{{ s.sub }}</span></span>
        <button v-if="s.act && !s.done" type="button" class="go" @click="s.act">{{ s.go }}</button>
      </li>
    </ul>
    <button type="button" class="all" :aria-expanded="open" @click="open = !open">{{ open ? t.stLess : t.stAll }}</button>
  </section>
</template>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--surface);
  padding: 4px 14px 6px;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}
header > div {
  flex: 1;
}
.k {
  font-size: calc(13px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--muted);
}
.prog {
  margin-top: 8px;
  display: flex;
  gap: 5px;
}
.prog span {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: var(--line);
}
.prog span.on {
  background: var(--accent);
}
.hide {
  height: 44px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
.all {
  height: 44px;
  padding: 0 2px;
  border: 0;
  border-top: 1px solid var(--line);
  width: 100%;
  background: transparent;
  color: var(--muted);
  font-size: calc(13px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: left;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 6px 0;
  border-top: 1px solid var(--line);
}
li:first-child {
  border-top: 0;
}
.ck {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--line2);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.done .ck {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on);
}
.tx {
  flex: 1;
  min-width: 0;
}
.tt {
  display: block;
  font-size: calc(19px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
}
.done .tt {
  color: var(--muted);
  text-decoration: line-through;
}
.ss {
  display: block;
  margin-top: 1px;
  font-size: calc(15px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.2;
}
.go {
  flex: none;
  height: 44px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
</style>
