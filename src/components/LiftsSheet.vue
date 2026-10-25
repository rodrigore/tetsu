<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import LiftsEditor from './LiftsEditor.vue'
import Sheet from './Sheet.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const empty = computed(() => app.s.lifts.every((l) => l.example))
function enter() {
  ui.open.lifts = false
  setTimeout(() => (document.getElementById('pr-input') as HTMLInputElement | null)?.focus(), 50)
}
</script>

<template>
  <Sheet :title="t.liftsTitle" @close="ui.open.lifts = false">
    <section v-if="empty" class="empty">
      <div class="h">{{ t.emMarkT }}</div>
      <p>{{ t.emMarkD }}</p>
      <button type="button" @click="enter">{{ t.emMarkBtn }}</button>
    </section>
    <LiftsEditor />
  </Sheet>
</template>

<style scoped>
.empty {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--accent);
  background: var(--surface);
}
.h {
  font-size: calc(23px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
}
p {
  margin: 4px 0 0;
  font-size: calc(17px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.3;
}
button {
  margin-top: 12px;
  height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
</style>
