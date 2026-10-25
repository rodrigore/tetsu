<script setup lang="ts">
import { computed } from 'vue'
import { useApp, type Settings } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { PALETTES } from '../core/palette'
import { fmt, fmtW } from '../core/format'
import { toKg, parseNumber, type Unit } from '../core/units'
import Sheet from './Sheet.vue'
import Section from './Section.vue'
import Seg from './Seg.vue'
import AddRow from './AddRow.vue'
import PresetsSection from './PresetsSection.vue'
import PercentList from './PercentList.vue'
import { useToast } from '../stores/toast'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const s = app.s
const toast = useToast()

const tabs = computed(() => [
  { value: 'display' as const, label: t.value.tabDisplay },
  { value: 'bar' as const, label: t.value.tabBar },
  { value: 'general' as const, label: t.value.tabGeneral },
])

const barText = (b: { value: number; unit: string }) => `${fmtW(b.value, s.lang)} ${b.unit.toUpperCase()}`

function addBar(value: number, unit: Unit) {
  const kg = toKg(value, unit)
  if (kg < 2 || kg > 40 || s.bars.length >= 4) return false
  if (s.bars.some((b) => b.value === value && b.unit === unit)) return true
  s.bars.push({ value, unit })
  return true
}
function removeBar(i: number) {
  if (s.bars.length <= 1) return
  const before = s.bars.map((b) => ({ ...b }))
  const beforeIndex = s.barIndex
  s.bars.splice(i, 1)
  s.barIndex = Math.min(s.barIndex, s.bars.length - 1)
  toast.show(t.value.removedBar, () => {
    s.bars = before
    s.barIndex = beforeIndex
  })
}

const collarOpts = [0, 0.25, 2.5].map((v) => ({ value: v }))
const quickText = (i: number) => fmt(s.quick[i]!, s.lang)
function setQuick(i: number, e: Event) {
  const n = parseNumber((e.target as HTMLInputElement).value)
  if (n !== null && n >= 1 && n <= 200) s.quick[i] = n
}
const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => {
  s[k] = v
}
</script>

<template>
  <Sheet :title="t.settings" @close="ui.open.settings = false">
    <Section :title="t.setBasic">
      <div class="basic">
        <div class="brow">
          <div class="bt"><span>{{ t.prUnit }}</span><small>{{ t.prUnitHint }}</small></div>
          <Seg :model-value="s.unit" :options="[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }]" @update:model-value="set('unit')($event)" />
        </div>
        <button type="button" class="brow link" @click="ui.open.inventory = true">
          <span class="bt"><span>{{ t.myPlates }}</span><small>{{ t.invHint }}</small></span>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <div class="brow">
          <div class="bt"><span>{{ t.awakeTitle }}</span><small>{{ t.awakeHint }}</small></div>
          <Seg :model-value="s.awake" :options="[{ value: false, label: t.no }, { value: true, label: t.yes }]" @update:model-value="set('awake')($event)" />
        </div>
        <div class="brow">
          <div class="bt"><span>{{ t.language }}</span></div>
          <Seg :model-value="s.lang" :options="[{ value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }]" @update:model-value="set('lang')($event)" />
        </div>
      </div>
    </Section>

    <Section :title="t.setAdvanced">
      <button type="button" class="brow link adv" :aria-expanded="ui.advanced" @click="ui.advanced = !ui.advanced">
        <span class="bt"><span>{{ t.advMore }}</span><small>{{ t.advHint }}</small></span>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path :d="ui.advanced ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'" /></svg>
      </button>
    </Section>

    <template v-if="ui.advanced">
    <Seg v-model="ui.tab.settings" :options="tabs" />

    <template v-if="ui.tab.settings === 'display'">
      <PresetsSection />
      <Section :title="t.sideShown">
        <Seg
          :model-value="s.side"
          :options="[{ value: 'kg', label: 'KG' }, { value: 'lb', label: 'LB' }, { value: 'both', label: t.both }]"
          @update:model-value="set('side')($event)"
        />
      </Section>
      <Section :title="t.offBy" :hint="t.diffHint">
        <Seg :model-value="s.showDiff" :options="[{ value: true, label: t.yes }, { value: false, label: t.no }]" @update:model-value="set('showDiff')($event)" />
      </Section>
      <Section :title="t.bigNumber">
        <Seg
          :model-value="s.hero"
          :options="[{ value: 'side', label: t.heroSide }, { value: 'target', label: t.target }, { value: 'total', label: t.heroTotal }]"
          @update:model-value="set('hero')($event)"
        />
      </Section>
      <Section :title="t.palette">
        <div class="pal">
          <button
            v-for="p in PALETTES"
            :key="p.id"
            type="button"
            :class="{ on: s.accent === p.accent }"
            :aria-pressed="s.accent === p.accent"
            @click="s.accent = p.accent"
          >
            <span class="sw" :style="{ background: p.accent }" aria-hidden="true" />{{ p.name[s.lang] }}
          </button>
        </div>
      </Section>
      <Section :title="t.style" :hint="s.look === 'full' ? t.styleHintFull : t.styleHintMin">
        <Seg :model-value="s.look" :options="[{ value: 'full', label: t.full }, { value: 'minimal', label: t.minimal }]" @update:model-value="set('look')($event)" />
      </Section>
      <Section :title="t.textSize">
        <Seg :model-value="s.tsize" :options="[{ value: 'normal', label: t.normal }, { value: 'large', label: t.large }]" @update:model-value="set('tsize')($event)" />
      </Section>
      <Section :title="t.theme">
        <Seg
          :model-value="s.theme"
          :options="[{ value: 'auto', label: t.auto }, { value: 'dark', label: t.dark }, { value: 'light', label: t.light }]"
          @update:model-value="set('theme')($event)"
        />
      </Section>
      <Section :title="t.contrast">
        <Seg :model-value="s.contrast" :options="[{ value: 'normal', label: t.normal }, { value: 'high', label: t.high }]" @update:model-value="set('contrast')($event)" />
      </Section>
      <Section :title="t.plateColors" :hint="t.pcolHint">
        <Seg :model-value="s.olympic" :options="[{ value: false, label: t.byUnit }, { value: true, label: t.olympic }]" @update:model-value="set('olympic')($event)" />
      </Section>
      <Section :title="t.oneHandTitle" :hint="t.oneHandHint">
        <Seg :model-value="s.oneHand" :options="[{ value: false, label: t.no }, { value: true, label: t.yes }]" @update:model-value="set('oneHand')($event)" />
      </Section>
      <Section :title="t.orientTitle" :hint="t.orientHint">
        <Seg :model-value="s.porient" :options="[{ value: 'vertical', label: t.vertical }, { value: 'horizontal', label: t.horizontal }]" @update:model-value="set('porient')($event)" />
      </Section>
    </template>

    <template v-else-if="ui.tab.settings === 'bar'">
      <Section :title="t.round" :hint="s.round === 'near' ? t.roundHintNear : s.round === 'down' ? t.roundHintDown : t.roundHintUp">
        <Seg
          :model-value="s.round"
          :options="[{ value: 'near', label: t.roundNear }, { value: 'down', label: t.roundDown }, { value: 'up', label: t.roundUp }]"
          @update:model-value="set('round')($event)"
        />
      </Section>
      <Section :title="t.inventory" :hint="t.invHint">
        <button type="button" class="wide" @click="ui.open.inventory = true">{{ t.inventoryBtn }}</button>
      </Section>
      <Section :title="t.barsTitle">
        <div class="chips">
          <div v-for="(b, i) in s.bars" :key="b.value + b.unit" class="chip">
            <span class="display">{{ barText(b) }}</span>
            <button v-if="s.bars.length > 1" type="button" :aria-label="`${t.removeAria} ${barText(b)}`" @click="removeBar(i)">×</button>
          </div>
        </div>
        <AddRow :aria="t.addBarAria" :add-label="t.add" :error="t.barErr" :default-unit="s.unit" :on-add="addBar" />
      </Section>
      <Section :title="t.collars" :hint="t.collarsHint">
        <Seg
          :model-value="s.collarKg"
          :options="collarOpts.map((o) => ({ value: o.value, label: o.value === 0 ? t.none : fmtW(o.value, s.lang) + ' KG' }))"
          @update:model-value="set('collarKg')($event)"
        />
      </Section>
    </template>

    <template v-else>
      <Section :title="t.liftsTitle" :hint="t.liftsHint">
        <button type="button" class="wide" @click="ui.open.lifts = true">{{ t.liftsTitle }}</button>
      </Section>
      <Section :title="t.pctStepTitle">
        <Seg :model-value="s.pstep" :options="[1, 2.5, 5].map((v) => ({ value: v, label: fmt(v, s.lang) + '%' }))" @update:model-value="set('pstep')($event)" />
      </Section>
      <Section :title="t.warmSettings" :hint="t.warmHint">
        <PercentList v-model="s.warm" :min="1" :max="99" :max-items="5" />
      </Section>
      <Section :title="t.quickTitle" :hint="t.quickHint">
        <div class="quick">
          <input v-for="(_, i) in s.quick" :key="i" type="text" inputmode="decimal" :value="quickText(i)" @change="setQuick(i, $event)" />
        </div>
        <button type="button" class="wide" @click="s.quick = [60, 70, 80, 90, 95, 100]">{{ t.reset }}</button>
      </Section>
    </template>
    </template>

    <Section :title="t.setHelp">
      <div class="basic">
        <button type="button" class="brow link" @click="ui.open.settings = false; ui.open.guide = 1">
          <span class="bt"><span>{{ t.guideBtn }}</span></span>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <button type="button" class="brow link" @click="s.steps.hidden = false; ui.open.settings = false">
          <span class="bt"><span>{{ t.stReopen }}</span><small>{{ t.stReopenH }}</small></span>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </Section>
  </Sheet>
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
}
.brow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  padding: 8px 0;
  border: 0;
  border-top: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  text-align: left;
}
.brow.link {
  width: 100%;
}
.brow.adv {
  border-bottom: 1px solid var(--line);
}
.bt {
  flex: 1;
  min-width: 0;
}
.bt > span {
  display: block;
  font-size: calc(19px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
}
.bt small {
  display: block;
  margin-top: 2px;
  font-size: calc(14px * var(--ts));
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--muted);
  line-height: 1.2;
}
.pal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pal button {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
.pal button.on {
  border-color: var(--text);
}
.sw {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}
.wide {
  width: 100%;
  height: 48px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line2);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.12em;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: flex;
  align-items: center;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
}
.chip .display {
  padding: 0 12px;
  font-size: 20px;
  line-height: 1;
}
.chip button {
  width: 44px;
  height: 42px;
  padding: 0;
  border: 0;
  border-left: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font-size: 18px;
}
.quick {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}
.quick input {
  min-width: 0;
  height: 44px;
  text-align: center;
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
  font-size: calc(16px * var(--ts));
  font-weight: 700;
}
</style>
