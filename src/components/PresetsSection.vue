<script setup lang="ts">
import { computed, ref } from 'vue'
import { PRESET_KEYS, useApp, type Preset } from '../stores/app'
import { messages } from '../core/i18n'
import Section from './Section.vue'
import { useToast } from '../stores/toast'

const app = useApp()
const t = computed(() => messages(app.s.lang))
const name = ref('')
const toast = useToast()

const label = (p: Preset) => (typeof p.name === 'string' ? p.name : p.name[app.s.lang])

function apply(p: Preset) {
  Object.assign(app.s, JSON.parse(JSON.stringify(p.vals)))
  app.s.presetId = p.id
}
function save() {
  const nm = name.value.trim().toLocaleUpperCase(app.s.lang).slice(0, 14)
  if (!nm) return
  const vals: Preset['vals'] = {}
  for (const k of PRESET_KEYS) (vals as Record<string, unknown>)[k] = JSON.parse(JSON.stringify(app.s[k]))
  const id = `p${Date.now()}`
  app.s.presets.push({ id, name: nm, vals })
  app.s.presetId = id
  name.value = ''
}
function remove(p: Preset) {
  const before = app.s.presets
  const beforeId = app.s.presetId
  app.s.presets = app.s.presets.filter((x) => x.id !== p.id)
  if (app.s.presetId === p.id) app.s.presetId = null
  toast.show(t.value.removedProfile, () => {
    app.s.presets = before
    app.s.presetId = beforeId
  })
}
</script>

<template>
  <Section :title="t.presets" :hint="t.presetsHint">
    <div class="list">
      <div v-for="p in app.s.presets" :key="p.id" class="item">
        <button type="button" :class="{ on: app.s.presetId === p.id }" :aria-pressed="app.s.presetId === p.id" @click="apply(p)">
          {{ label(p) }}
        </button>
        <button v-if="!p.seed" type="button" class="rm" :aria-label="`${t.removeAria} ${label(p)}`" @click="remove(p)">×</button>
      </div>
    </div>
    <div class="save">
      <input v-model="name" type="text" :placeholder="t.presetName" :aria-label="t.presetName" @keydown.enter="save" />
      <button type="button" @click="save">{{ t.saveCurrent }}</button>
    </div>
  </Section>
</template>

<style scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.item {
  display: flex;
  align-items: center;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
  overflow: hidden;
}
.item button {
  height: 42px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: calc(17px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
.item button.on {
  background: var(--accent);
  color: var(--on);
}
.item .rm {
  width: 40px;
  padding: 0;
  border-left: 1px solid var(--line);
  color: var(--muted);
  font-size: 18px;
}
.save {
  display: flex;
  gap: 8px;
  align-items: center;
}
.save input {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 4px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--line2);
  border-radius: 0;
  color: var(--text);
  font-size: calc(20px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.04em;
  outline: none;
}
.save button {
  flex: none;
  height: 48px;
  padding: 0 16px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on);
  border: 0;
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
</style>
