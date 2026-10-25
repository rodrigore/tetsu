<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'
import { clampRest, parseRest, REST_STEP, splitRest } from '../core/rest'
import { selectAll } from '../core/selectAll'

/** Minutes and seconds you can type, plus 15 s steps. Any value from 5 s to 1 h. */
const model = defineModel<number>({ required: true })
const app = useApp()
const t = computed(() => messages(app.s.lang))

const m = ref(String(splitRest(model.value).m))
const s = ref(String(splitRest(model.value).s))
const sync = () => {
  const p = splitRest(model.value)
  m.value = String(p.m)
  s.value = String(p.s)
}
watch(model, sync)

function commit() {
  const v = parseRest(m.value, s.value)
  if (v !== null) model.value = v
  sync()
}
const bump = (d: number) => (model.value = clampRest(model.value + d))
</script>

<template>
  <div class="rest">
    <button type="button" :aria-label="t.trRestLess" @click="bump(-REST_STEP)">−</button>
    <label class="f"><input v-model="m" type="text" inputmode="numeric" :aria-label="t.trMin" @focus="selectAll" @change="commit" /><small>{{ t.trMinShort }}</small></label>
    <label class="f"><input v-model="s" type="text" inputmode="numeric" :aria-label="t.trSec" @focus="selectAll" @change="commit" /><small>{{ t.trSecShort }}</small></label>
    <button type="button" :aria-label="t.trRestMore" @click="bump(REST_STEP)">+</button>
  </div>
</template>

<style scoped>
.rest { display: flex; align-items: center; gap: 8px; }
.rest > button { flex: none; width: 48px; height: 48px; border-radius: 8px; border: 1px solid var(--line2); background: var(--surface); color: var(--text); font-size: 24px; }
.f { display: flex; align-items: center; justify-content: center; gap: 4px; height: 48px; min-width: 0; flex: 1; border-radius: 8px; border: 1px solid var(--line2); background: var(--surface); }
.f input { width: 44px; min-width: 0; padding: 0; text-align: right; background: transparent; border: 0; outline: none; color: var(--text); font-size: calc(26px * var(--ts)); font-weight: 700; }
.f small { width: 30px; font-size: calc(14px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; color: var(--muted); }
</style>
