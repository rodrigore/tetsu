<script setup lang="ts">
import { ref } from 'vue'
import { parseNumber, type Unit } from '../core/units'

const props = defineProps<{
  aria: string
  addLabel: string
  error: string
  defaultUnit: Unit
  /** Return true when accepted; the input is cleared then. */
  onAdd: (value: number, unit: Unit) => boolean
}>()

const raw = ref('')
const unit = ref<Unit>(props.defaultUnit)
const bad = ref(false)

function add() {
  const n = parseNumber(raw.value)
  if (n === null || !props.onAdd(n, unit.value)) {
    bad.value = true
    return
  }
  raw.value = ''
  bad.value = false
}
</script>

<template>
  <div>
    <div class="row">
      <input
        v-model="raw"
        class="field"
        type="text"
        inputmode="decimal"
        :aria-label="aria"
        @input="bad = false"
        @keydown.enter="add"
      />
      <div class="units">
        <button v-for="u in (['kg', 'lb'] as Unit[])" :key="u" type="button" :class="{ on: unit === u }" :aria-pressed="unit === u" @click="unit = u">
          {{ u.toUpperCase() }}
        </button>
      </div>
      <button type="button" class="add" @click="add">{{ addLabel }}</button>
    </div>
    <div v-if="bad" class="err" role="alert">{{ error }}</div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.field {
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
.units {
  display: flex;
  flex: none;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}
.units button {
  height: 46px;
  padding: 0 12px;
  border: 0;
  background: var(--surface);
  color: var(--text);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.units button.on {
  background: var(--accent);
  color: var(--on);
}
.add {
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
.err {
  margin-top: 8px;
  font-size: calc(15px * var(--ts));
  font-weight: 600;
  color: var(--accent);
}
</style>
