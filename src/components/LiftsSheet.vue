<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp, type Lift } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { fmt } from '../core/format'
import { fromKg, parseNumber, toKg } from '../core/units'
import Sheet from './Sheet.vue'
import Section from './Section.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))

const nameOf = (l: Lift) => (typeof l.name === 'string' ? l.name : l.name[app.s.lang])
const setName = (l: Lift, e: Event) => (l.name = (e.target as HTMLInputElement).value)
const prText = (l: Lift) => fmt(fromKg(l.kg, app.s.unit), app.s.lang)
function setPr(l: Lift, e: Event) {
  const n = parseNumber((e.target as HTMLInputElement).value)
  if (n !== null && n <= 1000) l.kg = toKg(n, app.s.unit)
  else (e.target as HTMLInputElement).value = prText(l)
}
function remove(l: Lift) {
  if (app.s.lifts.length <= 1) return
  app.s.lifts = app.s.lifts.filter((x) => x.id !== l.id)
  if (app.s.liftId === l.id) app.s.liftId = app.s.lifts[0]!.id
}

const newName = ref('')
const newPr = ref('')
const bad = ref(false)
function add() {
  const name = newName.value.trim()
  const n = parseNumber(newPr.value)
  if (!name || n === null || n <= 0 || n > 1000) {
    bad.value = true
    return
  }
  const id = `l${Date.now()}`
  app.s.lifts.push({ id, name: name.toLocaleUpperCase(app.s.lang), kg: toKg(n, app.s.unit) })
  app.s.liftId = id
  newName.value = newPr.value = ''
  bad.value = false
}
</script>

<template>
  <Sheet :title="t.liftsTitle" @close="ui.open.lifts = false">
    <p class="hint">{{ t.liftsHint }}</p>
    <div v-for="l in app.s.lifts" :key="l.id" class="row">
      <input class="name" type="text" :value="nameOf(l)" :aria-label="nameOf(l)" @change="setName(l, $event)" />
      <input class="pr display" type="text" inputmode="decimal" :value="prText(l)" :aria-label="`PR ${nameOf(l)}`" @change="setPr(l, $event)" />
      <span class="u">{{ app.s.unit.toUpperCase() }}</span>
      <button v-if="app.s.lifts.length > 1" type="button" :aria-label="`${t.removeAria} ${nameOf(l)}`" @click="remove(l)">×</button>
    </div>
    <Section :title="t.newLift">
      <div class="row add">
        <input v-model="newName" class="name" type="text" :aria-label="t.liftNameAria" :placeholder="t.liftNameAria" @input="bad = false" />
        <input v-model="newPr" class="pr display" type="text" inputmode="decimal" aria-label="PR" placeholder="PR" @input="bad = false" @keydown.enter="add" />
        <button type="button" class="addbtn" @click="add">{{ t.add }}</button>
      </div>
      <div v-if="bad" class="err" role="alert">{{ t.liftErr }}</div>
    </Section>
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
.row {
  display: flex;
  align-items: center;
  gap: 8px;
}
input {
  height: 48px;
  min-width: 0;
  padding: 0 4px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--line2);
  border-radius: 0;
  color: var(--text);
  outline: none;
}
.name {
  flex: 1;
  font-size: calc(17px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
}
.pr {
  width: 78px;
  font-size: 24px;
}
.u {
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.1em;
}
.row > button {
  width: 40px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 18px;
}
.row > .addbtn {
  width: auto;
  padding: 0 16px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
.err {
  margin-top: 8px;
  font-size: calc(15px * var(--ts));
  font-weight: 600;
  color: var(--accent);
}
</style>
