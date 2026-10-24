<script setup lang="ts">
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'

defineProps<{ title: string }>()
defineEmits<{ close: [] }>()
const app = useApp()
</script>

<template>
  <section class="sheet hide-scroll" role="dialog" :aria-label="title">
    <div class="inner">
      <header>
        <h2 class="display">{{ title }}</h2>
        <button type="button" class="done" @click="$emit('close')">{{ messages(app.s.lang).done }}</button>
      </header>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.sheet {
  position: fixed;
  inset: 0;
  z-index: 10;
  overflow-y: auto;
  background: var(--bg);
}
.inner {
  max-width: 480px;
  margin: 0 auto;
  padding: max(20px, env(safe-area-inset-top)) 24px max(28px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 22px;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
h2 {
  margin: 0;
  font-size: 34px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
}
.done {
  height: 44px;
  padding: 0 22px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on);
  border: 0;
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.12em;
}
</style>
