<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'
import { useApp } from './stores/app'
import { useUi } from './stores/ui'
import { useLoad } from './core/useLoad'
import { paletteOf } from './core/palette'
import BarPicker from './components/BarPicker.vue'
import BarView from './components/BarView.vue'
import HeroValue from './components/HeroValue.vue'
import InventorySheet from './components/InventorySheet.vue'
import LiftTabs from './components/LiftTabs.vue'
import LiftsSheet from './components/LiftsSheet.vue'
import PctControl from './components/PctControl.vue'
import PlateChips from './components/PlateChips.vue'
import PrField from './components/PrField.vue'
import SettingsSheet from './components/SettingsSheet.vue'
import StatsStrip from './components/StatsStrip.vue'
import GuideSheet from './components/GuideSheet.vue'
import { useWakeLock } from './core/useWakeLock'

const app = useApp()
const ui = useUi()

// "auto" follows the phone's light/dark setting.
const mq = window.matchMedia('(prefers-color-scheme: light)')
const sysLight = ref(mq.matches)
const onMq = (e: MediaQueryListEvent) => (sysLight.value = e.matches)
mq.addEventListener('change', onMq)
onBeforeUnmount(() => mq.removeEventListener('change', onMq))

const isLight = computed(() => app.s.theme === 'light' || (app.s.theme === 'auto' && sysLight.value))

watchEffect(() => {
  const root = document.documentElement
  root.dataset.theme = isLight.value ? 'light' : 'dark'
  root.dataset.contrast = app.s.contrast
  root.dataset.tsize = app.s.tsize
  const pal = paletteOf(app.s.accent)
  root.style.setProperty('--accent', isLight.value ? pal.accentLight : pal.accent)
  root.lang = app.s.lang
})

useWakeLock(computed(() => app.s.awake))
if (!app.s.guideDone) ui.open.guide = 1

const { t, used, looks, chips, hero, targetKg, result, diffText, exact } = useLoad(() => isLight.value)
const full = computed(() => app.s.look === 'full')
</script>

<template>
  <main class="screen" :class="{ 'one-hand': app.s.oneHand }">
    <div class="col-left">
      <BarPicker class="o-header" />
      <LiftTabs class="o-lifts" />
      <PrField class="o-pr" />
    </div>
    <HeroValue class="o-hero" :hero="hero" />
    <BarView class="o-bar" :used="used" :looks="looks" />
    <PlateChips v-if="full" class="o-chips" :chips="chips" :empty="used.length === 0" :empty-text="t.emptyBar" />
    <StatsStrip v-if="full" class="o-stats" :t="t" :target-kg="targetKg" :total-kg="result.totalKg" :diff-text="diffText" :exact="exact" />
    <PctControl class="o-pct" />
  </main>
  <SettingsSheet v-if="ui.open.settings" />
  <InventorySheet v-if="ui.open.inventory" />
  <LiftsSheet v-if="ui.open.lifts" />
  <GuideSheet v-if="ui.open.guide" />
</template>

<style scoped>
.screen {
  --pad: 24px;
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
.col-left {
  display: contents;
}
.o-header { order: 0; }
.o-lifts { order: 1; }
.o-pr { order: 2; }
.o-hero { order: 3; }
.o-bar { order: 4; }
.o-chips { order: 6; }
.o-stats { order: 7; }
.o-pct { order: 8; }
/* One-hand: results on top, selectors near the thumb. */
.one-hand .o-hero { order: 0; }
.one-hand .o-bar { order: 1; }
.one-hand .o-chips { order: 3; }
.one-hand .o-stats { order: 4; }
.one-hand .o-header { order: 5; }
.one-hand .o-lifts { order: 6; }
.one-hand .o-pr { order: 7; }
.screen > :deep(.wrap) {
  flex: 1 1 auto;
}

/* Phone on its side: three columns on top, the bar across the full width below. */
@media (orientation: landscape) and (max-height: 500px) {
  .screen {
    --pad: 20px;
    max-width: none;
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr) 230px;
    grid-template-rows: auto minmax(100px, 1fr) auto;
    column-gap: 20px;
    row-gap: 6px;
    padding: max(12px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) 12px max(20px, env(safe-area-inset-left));
  }
  .col-left {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .screen > :deep(.o-hero) { grid-column: 2; grid-row: 1; order: 0; min-width: 0; }
  .screen > :deep(.o-pct) { grid-column: 3; grid-row: 1; order: 0; min-width: 0; }
  .screen > :deep(.o-bar) { grid-column: 1 / -1; grid-row: 2; order: 0; min-height: 0; }
  .screen > :deep(.o-chips) { grid-column: 1 / -1; grid-row: 3; order: 0; }
  .col-left > :deep(*) { order: 0 !important; }
  .screen :deep(.hint) { display: none; }
  .screen > :deep(.o-stats) { display: none; }
}
</style>
