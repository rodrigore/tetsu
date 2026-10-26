<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
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
import ChangeStrip from './components/ChangeStrip.vue'
import WarmupSheet from './components/WarmupSheet.vue'
import ShareSheet from './components/ShareSheet.vue'
import PrCalcSheet from './components/PrCalcSheet.vue'
import ManualSheet from './components/ManualSheet.vue'
import PlanSheet from './components/PlanSheet.vue'
import TrainSheet from './components/TrainSheet.vue'
import RoundAlt from './components/RoundAlt.vue'
import TabBar from './components/TabBar.vue'
import StepsCard from './components/StepsCard.vue'
import TipCard from './components/TipCard.vue'
import LayoutSheet from './components/LayoutSheet.vue'
import LayoutEditor from './components/LayoutEditor.vue'
import OnboardingSheet from './components/OnboardingSheet.vue'
import { useTrain } from './stores/train'
import Toast from './components/Toast.vue'
import InstallHint from './components/InstallHint.vue'
import { useToast } from './stores/toast'
import GuideSheet from './components/GuideSheet.vue'
import { focusPr } from './core/focusPr'
import { useWakeLock } from './core/useWakeLock'
import { HERO_SCALE, landscapePlacement, placement, resolve, type BlockId } from './core/layout'
import { LANDSCAPE_PHONE, useMq } from './core/useMq'

const app = useApp()
const ui = useUi()
const toast = useToast()
const train = useTrain()

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

useWakeLock(computed(() => app.s.awake || train.active))
if (!app.s.guideDone) ui.open.onboarding = true

const { t, used, looks, chips, hero, targetKg, result, diffText, exact, notice, plateInfo, shareMessage } = useLoad(() => isLight.value)
const landscape = useMq(LANDSCAPE_PHONE)
const resolved = computed(() => resolve(app.s.layout))
const place = computed(() => (landscape.value ? landscapePlacement() : placement(resolved.value)))
const show = (b: BlockId) => place.value[b].show
// Rank 1..7 times 10 leaves room for the pieces that stay glued to a block (actions, rounding, tip).
const at = (b: BlockId, n = 0) => ({ order: place.value[b].rank * 10 + n })
const heroScale = computed(() => HERO_SCALE[resolved.value.size])
// A rounding picked for one target does not carry over to the next.
watch(targetKg, () => (ui.roundPick = null))

const showExample = computed(() => app.s.guideDone && app.s.steps.hidden && app.lift.example)

// Native share sheet where it exists (iPhone), clipboard otherwise.
async function share() {
  const text = shareMessage()
  try {
    if (navigator.share) {
      await navigator.share({ text })
      return
    }
  } catch (e) {
    if ((e as DOMException).name === 'AbortError') return
  }
  try {
    await navigator.clipboard.writeText(text)
    toast.show(t.value.copied)
  } catch {
    toast.show(text, undefined, 12000)
  }
}
</script>

<template>
  <main class="screen">
    <div class="col-left">
      <BarPicker v-if="show('head')" class="o-header" :style="at('head')" />
      <LiftTabs v-if="show('head')" class="o-lifts" :style="at('head', 1)" />
      <PrField v-if="show('pr')" class="o-pr" :style="at('pr')" />
    </div>
    <StepsCard class="o-steps" />
    <HeroValue v-if="show('hero')" class="o-hero" :style="at('hero')" :hero="hero" :notice="notice" :full="show('stats') || show('chips')" :scale="heroScale" />
    <BarView class="o-bar" :style="at('bar')" :used="used" :looks="looks" />
    <TipCard class="o-tip" :style="at('bar', 1)" id="plates" :title="t.tipPlates" :text="t.tipPlatesD" :show="app.s.guideDone && used.length > 1" />
    <ChangeStrip class="o-actions" :style="at('bar', 2)" :used="used" :info="plateInfo" @share="ui.open.share = true" />
    <RoundAlt class="o-round" :style="at('bar', 3)" />
    <PlateChips v-if="show('chips')" class="o-chips" :style="at('chips')" :chips="chips" :empty="used.length === 0" :empty-text="t.emptyBar" />
    <StatsStrip v-if="show('stats')" class="o-stats" :style="at('stats')" :t="t" :target-kg="targetKg" :total-kg="result.totalKg" :diff-text="diffText" :exact="exact" />
    <PctControl v-if="show('pct')" class="o-pct" :style="at('pct')" :full="show('stats')" />
    <div v-if="showExample" class="o-example">
      <span>{{ t.exBanner }}</span>
      <button type="button" @click="focusPr">{{ t.exStart }}</button>
    </div>
  </main>
  <TabBar :used="used" />
  <OnboardingSheet v-if="ui.open.onboarding" />
  <SettingsSheet v-if="ui.open.settings" />
  <LayoutSheet v-if="ui.open.layout" />
  <LayoutEditor v-if="ui.open.layoutEdit" />
  <InventorySheet v-if="ui.open.inventory" />
  <LiftsSheet v-if="ui.open.lifts" />
  <WarmupSheet v-if="ui.open.warmup" />
  <PrCalcSheet v-if="ui.open.pr" />
  <ManualSheet v-if="ui.open.manual" />
  <PlanSheet v-if="ui.open.plan" />
  <TrainSheet v-if="train.active" />
  <ShareSheet v-if="ui.open.share" @text="share" />
  <GuideSheet v-if="ui.open.guide" />
  <InstallHint />
  <Toast />
</template>

<style scoped>
.screen {
  --pad: 24px;
  width: 100%;
  max-width: 480px;
  height: 100dvh;
  margin: 0 auto;
  padding: max(20px, env(safe-area-inset-top)) 24px calc(150px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
  overflow-y: auto;
}
@media (orientation: portrait) and (max-height: 780px) {
  .screen {
    gap: 8px;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: calc(144px + env(safe-area-inset-bottom));
  }
}
.screen > :deep(*),
.col-left > :deep(*) {
  flex: none;
}
.col-left {
  display: contents;
}
.o-steps { order: -1; }
.o-example { order: 999; }
.screen > :deep(.wrap) {
  flex: 1 1 auto;
}

.o-example {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px dashed var(--line2);
  font-size: calc(17px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.25;
}
.o-example span {
  flex: 1;
}
.o-example button {
  flex: none;
  height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.1em;
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
  .screen > :deep(.o-steps),
  .screen > :deep(.o-tip),
  .screen > :deep(.o-example) { display: none; }
  .col-left {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .screen > :deep(.o-hero) { grid-column: 2; grid-row: 1; order: 0 !important; min-width: 0; }
  .screen > :deep(.o-pct) { grid-column: 3; grid-row: 1; order: 0 !important; min-width: 0; }
  .screen > :deep(.o-bar) { grid-column: 1 / -1; grid-row: 2; order: 0 !important; min-height: 0; }
  .screen > :deep(.o-chips) { grid-column: 1 / -1; grid-row: 3; order: 0 !important; }
  .col-left > :deep(*) { order: 0 !important; }
  .screen :deep(.hint) { display: none; }
  .screen > :deep(.o-stats) { display: none; }
  .screen > :deep(.o-actions) { display: none; }
  .screen > :deep(.o-round) { display: none; }
}
</style>
