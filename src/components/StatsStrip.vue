<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { fmt } from '../core/format'
import { fromKg } from '../core/units'
import type { Dict } from '../core/i18n'

const props = defineProps<{
  t: Dict
  targetKg: number
  totalKg: number
  diffText: string
  exact: boolean
}>()
const app = useApp()
const U = computed(() => app.s.unit.toUpperCase())
const show = (kg: number) => fmt(fromKg(kg, app.s.unit), app.s.lang)
</script>

<template>
  <div class="strip" :class="{ two: !app.s.showDiff }">
    <div>
      <div class="k">{{ t.target }}</div>
      <div class="v display">{{ show(targetKg) }}<span class="u">{{ U }}</span></div>
    </div>
    <div>
      <div class="k">{{ t.onBar }}</div>
      <div class="v display">{{ show(totalKg) }}<span class="u">{{ U }}</span></div>
    </div>
    <div v-if="app.s.showDiff">
      <div class="k">{{ t.offBy }}</div>
      <div class="v display" :class="{ off: !exact }">
        {{ diffText }}<span v-if="!exact" class="u">{{ U }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strip {
  padding: 10px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.strip.two {
  grid-template-columns: repeat(2, 1fr);
}
.k {
  font-size: calc(12px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--muted);
  line-height: 1;
}
.v {
  margin-top: 6px;
  font-size: 24px;
  line-height: 1;
  white-space: nowrap;
}
.v.off {
  color: var(--accent);
}
.u {
  margin-left: 4px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: calc(13px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.off .u {
  color: var(--accent);
}
</style>
