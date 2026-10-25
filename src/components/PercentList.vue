<script setup lang="ts">
import { fmt } from '../core/format'
import { parseNumber } from '../core/units'
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'
import { computed } from 'vue'

const props = defineProps<{ modelValue: number[]; min: number; max: number; maxItems: number }>()
const emit = defineEmits<{ 'update:modelValue': [v: number[]] }>()
const app = useApp()
const t = computed(() => messages(app.s.lang))

function set(i: number, e: Event) {
  const input = e.target as HTMLInputElement
  const n = parseNumber(input.value)
  if (n === null || n < props.min || n > props.max) {
    input.value = fmt(props.modelValue[i]!, app.s.lang)
    return
  }
  const next = [...props.modelValue]
  next[i] = n
  emit('update:modelValue', next)
}
const remove = (i: number) => emit('update:modelValue', props.modelValue.filter((_, k) => k !== i))
const add = () => {
  const last = props.modelValue[props.modelValue.length - 1] ?? props.min
  emit('update:modelValue', [...props.modelValue, Math.min(props.max, last + 10)])
}
</script>

<template>
  <div class="list">
    <div v-for="(v, i) in modelValue" :key="i" class="cell">
      <input type="text" inputmode="decimal" :value="fmt(v, app.s.lang)" :aria-label="`${fmt(v, app.s.lang)} %`" @change="set(i, $event)" />
      <button v-if="modelValue.length > 1" type="button" :aria-label="`${t.removeAria} ${fmt(v, app.s.lang)} %`" @click="remove(i)">×</button>
    </div>
    <button v-if="modelValue.length < maxItems" type="button" class="add" @click="add">{{ t.addStep }}</button>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cell {
  display: flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
  overflow: hidden;
}
input {
  width: 56px;
  height: 44px;
  padding: 0;
  text-align: center;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: calc(17px * var(--ts));
  font-weight: 700;
}
.cell button {
  width: 34px;
  height: 44px;
  padding: 0;
  border: 0;
  border-left: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font-size: 16px;
}
.add {
  height: 46px;
  padding: 0 14px;
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  border: 1px dashed var(--line2);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
</style>
