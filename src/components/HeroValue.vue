<script setup lang="ts">
import { computed } from 'vue'
import { LANDSCAPE_PHONE, useMq } from '../core/useMq'

const props = defineProps<{
  hero: { side: boolean; text: string; unit: string; other: string; otherUnit: string; label: string; minLine: string }
  notice?: string
  /** The screen also shows the plate list or the stats: the hero can be a bit smaller. */
  full?: boolean
  /** Size chosen in the layout. */
  scale?: number
}>()

const landscape = useMq(LANDSCAPE_PHONE)
const short = useMq('(orientation: portrait) and (max-height: 780px)')
const full = computed(() => props.full ?? false)
const both = computed(() => props.hero.side && props.hero.other !== '')
const base = computed(() => Math.round((landscape.value ? 48 : short.value ? (full.value ? 56 : 64) : full.value ? 64 : 76) * (landscape.value ? 1 : (props.scale ?? 1))))
const room = computed(() => (landscape.value ? 200 : 232))
// Keep "main / other" on one line: shrink only when both numbers together would overflow.
const fit = computed(() => {
  const len = props.hero.text.length + props.hero.other.length
  return Math.max(landscape.value ? 28 : 40, Math.min(base.value, Math.floor(room.value / (0.45 * Math.max(len, 1)))))
})
// Landscape: main value big, the other unit smaller on its own line.
const mainSize = computed(() => (both.value && !landscape.value ? fit.value : base.value))
const otherSize = computed(() => (landscape.value ? 30 : fit.value))
</script>

<template>
  <div>
    <div class="lbl">{{ hero.label }}</div>
    <div class="line">
      <span class="display" :style="{ fontSize: mainSize + 'px' }">{{ hero.text }}</span>
      <span class="display unit">{{ hero.unit }}</span>
      <template v-if="both">
        <span class="display slash" aria-hidden="true" :style="{ fontSize: Math.round(otherSize * 0.5) + 'px' }">/</span>
        <span class="display" :style="{ fontSize: otherSize + 'px' }">{{ hero.other }}</span>
        <span class="display unit">{{ hero.otherUnit }}</span>
      </template>
    </div>
    <div v-if="(!full || landscape) && hero.minLine" class="min">{{ hero.minLine }}</div>
    <div v-if="notice" class="notice" role="alert">{{ notice }}</div>
  </div>
</template>

<style scoped>
.lbl {
  font-size: calc(13px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--muted);
  line-height: 1;
}
.line {
  margin-top: 6px;
  display: flex;
  flex-wrap: nowrap;
  align-items: baseline;
  gap: 8px;
  line-height: 1;
  white-space: nowrap;
}
@media (orientation: landscape) and (max-height: 500px) {
  .line {
    flex-wrap: wrap;
    row-gap: 2px;
  }
  .slash {
    display: none;
  }
}
.line > .display:not(.unit):not(.slash) {
  color: var(--text);
  line-height: 0.95;
}
.unit {
  font-size: 26px;
  letter-spacing: 0.04em;
  color: var(--accent);
}
.notice {
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--accent);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.2;
}
.slash {
  color: var(--muted);
  padding: 0 2px;
}
.min {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  line-height: 1;
}
</style>
