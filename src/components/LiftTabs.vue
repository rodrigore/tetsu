<script setup lang="ts">
import { useApp } from '../stores/app'

const app = useApp()
</script>

<template>
  <div class="tabs hide-scroll">
    <button
      v-for="l in app.s.lifts"
      :key="l.id"
      type="button"
      class="tab"
      :class="{ on: l.id === app.s.liftId }"
      :aria-pressed="l.id === app.s.liftId"
      @click="app.s.liftId = l.id"
    >
      {{ app.liftName(l) }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-right: -24px;
  padding-right: 24px;
}
.tab {
  flex: none;
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
}
.tab.on {
  background: var(--accent);
  color: var(--on);
  border-color: var(--accent);
}
</style>
