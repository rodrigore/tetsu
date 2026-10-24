<script setup lang="ts">
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'

const app = useApp()
const ui = useUi()
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
    <button type="button" class="tab add" @click="ui.open.lifts = true">{{ messages(app.s.lang).addLift }}</button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-right: calc(-1 * var(--pad, 24px));
  padding-right: var(--pad, 24px);
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
.tab.add {
  background: transparent;
  color: var(--accent);
  border: 1px dashed var(--line2);
}
.tab.on {
  background: var(--accent);
  color: var(--on);
  border-color: var(--accent);
}
</style>
