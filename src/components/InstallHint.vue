<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))

// Only where it helps: iPhone/iPad Safari, not yet installed.
const ua = navigator.userAgent
const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const standalone =
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches
const show = computed(() => ios && !standalone && app.s.guideDone && !app.s.installDismissed && ui.open.guide === 0)
</script>

<template>
  <aside v-if="show" class="hint" role="note">
    <div>
      <strong>{{ t.installTitle }}</strong>
      <p>{{ t.installBody }}</p>
    </div>
    <button type="button" @click="app.s.installDismissed = true">{{ t.gotIt }}</button>
  </aside>
</template>

<style scoped>
.hint {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: max(70px, calc(env(safe-area-inset-bottom) + 60px));
  z-index: 30;
  max-width: 456px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px 12px 16px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--line2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
}
strong {
  font-size: calc(14px * var(--ts));
  letter-spacing: 0.16em;
  color: var(--accent);
}
p {
  margin: 4px 0 0;
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  line-height: 1.25;
  color: var(--text);
}
button {
  flex: none;
  height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
}
@media (orientation: landscape) and (max-height: 500px) {
  .hint {
    display: none;
  }
}
</style>
