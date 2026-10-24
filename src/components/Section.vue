<script setup lang="ts">
defineProps<{ title: string; hint?: string }>()
</script>

<template>
  <div class="sec">
    <div class="t">{{ title }}</div>
    <slot />
    <div v-if="hint" class="h">{{ hint }}</div>
  </div>
</template>

<style scoped>
.sec {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.t {
  font-size: calc(13px * var(--ts));
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
  line-height: 1;
}
.h {
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--muted);
  line-height: 1.3;
}
</style>
