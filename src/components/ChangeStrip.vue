<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { diffPlates } from '../core/delta'
import { messages } from '../core/i18n'
import type { UsedPlate } from '../core/useLoad'

const props = defineProps<{
  used: UsedPlate[]
  info: (id: string) => { label: string; unit: string }
}>()
defineEmits<{ share: [] }>()

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))

const ids = computed(() => props.used.map((p) => p.def.id))
const diff = computed(() => (app.s.onBar ? diffPlates(app.s.onBar, ids.value) : null))
const same = computed(() => !!diff.value && diff.value.add.length === 0 && diff.value.remove.length === 0)
const mark = () => (app.s.onBar = [...ids.value])
const text = (c: { id: string; count: number }) => {
  const i = props.info(c.id)
  return `${c.count > 1 ? c.count + '×' : ''}${i.label} ${i.unit}`
}
</script>

<template>
  <div class="strip">
    <div v-if="diff" class="diff">
      <span class="k">{{ t.fromLast }}</span>
      <span v-if="same" class="none">{{ t.noChange }}</span>
      <template v-else>
        <span v-for="c in diff.remove" :key="'r' + c.id" class="chg rm">− {{ text(c) }}</span>
        <span v-for="c in diff.add" :key="'a' + c.id" class="chg add">+ {{ text(c) }}</span>
      </template>
      <button type="button" class="x" :aria-label="t.clearLoaded" @click="app.s.onBar = null">×</button>
    </div>
    <div class="btns">
      <button type="button" :disabled="same" @click="mark">{{ t.markLoaded }}</button>
      <button type="button" @click="ui.open.warmup = true">{{ t.warmup }}</button>
      <button type="button" @click="$emit('share')">{{ t.share }}</button>
    </div>
  </div>
</template>

<style scoped>
.strip {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.diff {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  min-height: 30px;
}
.k {
  font-size: calc(12px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--muted);
}
.none {
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.chg {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
}
.chg.add {
  color: var(--accent);
  border-color: var(--accent);
}
.chg.rm {
  color: var(--muted);
}
.x {
  margin-left: auto;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 18px;
}
.btns {
  display: flex;
  gap: 6px;
}
.btns button {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 6px;
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--line2);
  font-size: calc(13px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.btns button:disabled {
  color: var(--muted);
  border-color: var(--line);
}
</style>
