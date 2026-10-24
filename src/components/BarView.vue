<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useApp } from '../stores/app'
import { fmt } from '../core/format'
import { messages } from '../core/i18n'
import type { PlateLook } from '../core/plateView'
import type { UsedPlate } from '../core/useLoad'
import { fromKg, toKg } from '../core/units'

const props = defineProps<{ used: UsedPlate[]; looks: PlateLook[] }>()
const app = useApp()
const t = computed(() => messages(app.s.lang))

const sel = ref<number | null>(null)
watch(() => props.used, () => (sel.value = null))

const width = ref(390)
const el = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null
onMounted(() => {
  if (!el.value) return
  width.value = el.value.clientWidth
  ro = new ResizeObserver(() => el.value && (width.value = el.value.clientWidth))
  ro.observe(el.value)
})
onBeforeUnmount(() => ro?.disconnect())

const horiz = computed(() => app.s.porient !== 'vertical')

// Horizontal labels are upright and larger, so plates widen to fit their text.
const dims = computed(() =>
  props.looks.map((l, i) => {
    if (!horiz.value) return { w: l.w, fs: l.fs }
    const fsH = l.h >= 100 ? 18 : l.h >= 70 ? 16 : 14
    // The unit sits under the number, so the plate is as wide as the wider of the two.
    const num = props.used[i]!.label.length * fsH * 0.52
    const unit = 2 * Math.round(fsH * 0.6) * 0.62
    return { w: Math.max(l.w, Math.round(Math.max(num, unit) + 10)), fs: fsH }
  }),
)
const fit = computed(() => {
  const total = dims.value.reduce((a, d) => a + d.w + 3, 13)
  const room = width.value - 34
  return total > room ? room / total : 1
})

const legend = computed(() => {
  if (sel.value === null) return null
  const p = props.used[sel.value]
  if (!p) return null
  const otherUnit = p.unit === 'kg' ? 'lb' : 'kg'
  const other = fromKg(toKg(p.value, p.unit), otherUnit)
  return { a: `${p.label} ${p.unit.toUpperCase()}`, b: `${fmt(other, app.s.lang)} ${otherUnit.toUpperCase()}`, look: props.looks[sel.value]! }
})
</script>

<template>
  <div class="wrap">
    <div ref="el" class="bar">
      <div class="rod" aria-hidden="true" />
      <div class="plates">
        <div class="collar" aria-hidden="true" />
        <button
          v-for="(p, i) in used"
          :key="i"
          type="button"
          class="plate"
          :class="{ active: sel === i }"
          :aria-label="`${p.label} ${p.unit.toUpperCase()}`"
          :aria-pressed="sel === i"
          :style="{
            width: Math.max(6, Math.round(dims[i]!.w * fit)) + 'px',
            height: looks[i]!.h + 'px',
            background: looks[i]!.bg,
            borderRadius: looks[i]!.radius + 'px',
          }"
          @click="sel = sel === i ? null : i"
        >
          <span
            class="label"
            :class="{ vertical: !horiz }"
            :style="{ fontSize: Math.max(8, Math.round(dims[i]!.fs * Math.max(fit, 0.65))) + 'px' }"
          >{{ p.label }}<small v-if="horiz" class="unit">{{ p.unit.toUpperCase() }}</small><small v-else class="unit"> {{ p.unit.toUpperCase() }}</small></span>
        </button>
      </div>
      <div v-if="used.length === 0" class="empty">{{ t.emptyBar }}</div>
    </div>

    <div class="legend">
      <span v-if="legend" class="pillinfo">
        <span class="sw" :style="{ background: legend.look.bg, borderRadius: legend.look.radius + 'px' }" aria-hidden="true" />
        <span>{{ legend.a }}</span>
        <span class="eq">=</span>
        <span class="acc">{{ legend.b }}</span>
        <button type="button" class="x" :aria-label="t.closeAria" @click="sel = null">×</button>
      </span>
      <span v-else class="hint">{{ t.tapHint }}</span>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 160px;
  flex: 1;
}
.bar {
  position: relative;
  flex: 1;
  min-height: 110px;
  margin: 0 calc(-1 * var(--pad, 24px));
}
.rod {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  margin-top: -8px;
  height: 16px;
  background: var(--barc);
}
.plates {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  overflow: hidden;
}
.collar {
  flex: none;
  width: 12px;
  height: 60px;
  border-radius: 2px;
  background: var(--collar);
  margin-right: 1px;
}
.plate {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
}
.plate.active {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
.label {
  font-weight: 700;
  color: #0e0d0c;
  line-height: 1;
  letter-spacing: 0.04em;
  pointer-events: none;
  white-space: nowrap;
}
.label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.label.vertical {
  flex-direction: row;
  align-items: baseline;
  gap: 0;
}
.unit {
  font-size: 0.62em;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.8;
}
.label.vertical {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.empty {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  text-align: center;
  font-size: calc(12px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--muted);
}
.legend {
  min-height: 30px;
  display: flex;
  align-items: center;
}
.hint {
  font-size: calc(13px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--muted);
}
.pillinfo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 12px;
  border-radius: 15px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.sw {
  width: 10px;
  height: 14px;
}
.eq {
  color: var(--muted);
}
.acc {
  color: var(--accent);
}
.x {
  width: 30px;
  height: 30px;
  margin: 0 -8px 0 2px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 18px;
}
</style>
