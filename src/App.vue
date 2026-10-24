<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'
import { useApp } from './stores/app'
import { useLoad } from './core/useLoad'
import BarPicker from './components/BarPicker.vue'
import BarView from './components/BarView.vue'
import HeroValue from './components/HeroValue.vue'
import LiftTabs from './components/LiftTabs.vue'
import PctControl from './components/PctControl.vue'
import PlateChips from './components/PlateChips.vue'
import PrField from './components/PrField.vue'

const app = useApp()

// "auto" follows the phone's light/dark setting.
const mq = window.matchMedia('(prefers-color-scheme: light)')
const sysLight = ref(mq.matches)
const onMq = (e: MediaQueryListEvent) => (sysLight.value = e.matches)
mq.addEventListener('change', onMq)
onBeforeUnmount(() => mq.removeEventListener('change', onMq))

const isLight = computed(() => app.s.theme === 'light' || (app.s.theme === 'auto' && sysLight.value))

const DARK_TO_LIGHT: Record<string, string> = {
  '#FF5A1F': '#D84300', '#FF3B4E': '#D41F33', '#FF6FA8': '#D43A7C', '#A78BFA': '#7C5AE0',
  '#4DA3FF': '#1F6FD1', '#3DD6E8': '#0E8FA3', '#3DDC97': '#0F9A62', '#B8F03A': '#6E9A00', '#FFB400': '#B87D00',
}

watchEffect(() => {
  const root = document.documentElement
  root.dataset.theme = isLight.value ? 'light' : 'dark'
  root.dataset.contrast = app.s.contrast
  root.dataset.tsize = app.s.tsize
  root.style.setProperty('--accent', isLight.value ? DARK_TO_LIGHT[app.s.accent.toUpperCase()] ?? app.s.accent : app.s.accent)
  root.lang = app.s.lang
})

const { t, used, looks, chips, hero } = useLoad(() => isLight.value)
const full = computed(() => app.s.look === 'full')
</script>

<template>
  <main class="screen">
    <BarPicker />
    <LiftTabs />
    <PrField />
    <HeroValue :hero="hero" />
    <BarView :used="used" :looks="looks" />
    <PlateChips v-if="full" :chips="chips" :empty="used.length === 0" :empty-text="t.emptyBar" />
    <PctControl class="pct" />
  </main>
</template>

<style scoped>
.screen {
  width: 100%;
  max-width: 480px;
  height: 100dvh;
  margin: 0 auto;
  padding: max(20px, env(safe-area-inset-top)) 24px max(22px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}
.screen > :deep(*) {
  flex: none;
}
.screen > :deep(.wrap) {
  flex: 1 1 auto;
}
</style>
