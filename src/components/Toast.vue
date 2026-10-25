<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useToast } from '../stores/toast'
import { messages } from '../core/i18n'

const toast = useToast()
const app = useApp()
const t = computed(() => messages(app.s.lang))
</script>

<template>
  <div v-if="toast.current" class="toast" role="status" aria-live="polite">
    <span>{{ toast.current.text }}</span>
    <button v-if="toast.current.undo" type="button" @click="toast.undo()">{{ t.undo }}</button>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: max(18px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: calc(100vw - 32px);
  padding: 8px 8px 8px 16px;
  border-radius: 8px;
  background: var(--text);
  color: var(--bg);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
}
.toast button {
  height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
</style>
