<script setup lang="ts">
import { vDragScroll } from '../core/dragScroll'

defineProps<{ chips: { id: string; label: string; unit: string; count: number }[]; empty: boolean; emptyText: string }>()
</script>

<template>
  <div v-drag-scroll class="chips hide-scroll">
    <span v-if="empty" class="chip">{{ emptyText }}</span>
    <span v-for="c in chips" :key="c.id" class="chip">
      <span>{{ c.label }}</span>
      <span class="u">{{ c.unit }}</span>
      <span class="n">× {{ c.count }}</span>
    </span>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  min-height: 30px;
  align-items: center;
}
.chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
}
.u {
  font-size: calc(12px * var(--ts));
  letter-spacing: 0.08em;
  color: var(--muted);
}
.n {
  color: var(--accent);
}
</style>
