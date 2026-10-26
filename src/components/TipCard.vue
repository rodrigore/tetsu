<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'

const props = defineProps<{ id: string; title: string; text: string; show?: boolean }>()
const app = useApp()
const t = computed(() => messages(app.s.lang))
const visible = computed(() => (props.show ?? true) && !app.s.tips[props.id])
</script>

<template>
  <aside v-if="visible" class="tip" role="note">
    <div>
      <div class="h">{{ title }}</div>
      <div class="d">{{ text }}</div>
    </div>
    <button type="button" :aria-label="t.tipClose" @click="app.s.tips[id] = true">
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </aside>
</template>

<style scoped>
.tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 6px 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--accent);
  background: var(--surface);
}
.tip > div {
  flex: 1;
}
.h {
  font-size: calc(18px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.15;
}
.d {
  margin-top: 3px;
  font-size: calc(15px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.25;
}
button {
  flex: none;
  width: 44px;
  height: 44px;
  margin-top: -6px;
  border: 0;
  background: transparent;
  color: var(--muted);
}
</style>
