<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { allPlates, defaultPairs } from '../core/catalog'
import { fmtW } from '../core/format'
import { toKg, type Unit } from '../core/units'
import Sheet from './Sheet.vue'
import Section from './Section.vue'
import AddRow from './AddRow.vue'
import { useToast } from '../stores/toast'

const app = useApp()
const ui = useUi()
const toast = useToast()
const t = computed(() => messages(app.s.lang))
const rows = computed(() => allPlates(app.s.customPlates))
const count = (id: string) => app.s.inventory[id] ?? defaultPairs(id)
const bump = (id: string, d: number) => {
  app.s.inventory[id] = Math.max(0, Math.min(20, count(id) + d))
}

function addPlate(value: number, unit: Unit) {
  const kg = toKg(value, unit)
  if (value <= 0 || kg > 30) return false
  const exists = rows.value.find((p) => p.value === value && p.unit === unit)
  if (exists) {
    bump(exists.id, count(exists.id) === 0 ? 1 : 0)
    return true
  }
  app.s.customPlates.push({ value, unit })
  app.s.inventory[`c:${value}${unit}`] = 1
  return true
}
function removeCustom(id: string) {
  const i = app.s.customPlates.findIndex((p) => `c:${p.value}${p.unit}` === id)
  if (i < 0) return
  const plate = { ...app.s.customPlates[i]! }
  const pairs = app.s.inventory[id]
  app.s.customPlates.splice(i, 1)
  delete app.s.inventory[id]
  toast.show(t.value.removedPlate, () => {
    app.s.customPlates.splice(i, 0, plate)
    if (pairs !== undefined) app.s.inventory[id] = pairs
  })
}
</script>

<template>
  <Sheet :title="t.inventory" @close="ui.open.inventory = false">
    <p class="hint">{{ t.invHint }}</p>
    <ul>
      <li v-for="p in rows" :key="p.id" :class="{ zero: count(p.id) === 0 }">
        <span class="name"><span class="display">{{ fmtW(p.value, app.s.lang) }}</span> {{ p.unit.toUpperCase() }}</span>
        <button v-if="p.custom" type="button" class="rm" :aria-label="`${t.removeAria} ${p.value} ${p.unit}`" @click="removeCustom(p.id)">×</button>
        <span class="step">
          <button type="button" aria-label="−" @click="bump(p.id, -1)">−</button>
          <output class="display">{{ count(p.id) }}</output>
          <button type="button" aria-label="+" @click="bump(p.id, 1)">+</button>
        </span>
      </li>
    </ul>
    <Section :title="t.addPlate">
      <AddRow :aria="t.addPlateAria" :add-label="t.add" :error="t.addErr" :default-unit="app.s.unit" :on-add="addPlate" />
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
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 0 0 14px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
}
li.zero .name {
  color: var(--muted);
}
.name {
  flex: 1;
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.name .display {
  font-size: 24px;
  letter-spacing: 0.04em;
}
.step {
  display: flex;
  align-items: center;
}
.step button,
.rm {
  width: 44px;
  height: 46px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 22px;
}
.rm {
  color: var(--muted);
  font-size: 18px;
}
.step output {
  min-width: 28px;
  text-align: center;
  font-size: 24px;
}
</style>
