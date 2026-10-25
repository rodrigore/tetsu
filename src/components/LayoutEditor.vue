<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { cleanOrder, move, toggle, PRESET_LAYOUTS, type BlockId, type HeroSize } from '../core/layout'
import Sheet from './Sheet.vue'
import Seg from './Seg.vue'
import Section from './Section.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
const c = computed(() => app.s.layout.custom)
const order = computed(() => cleanOrder(c.value.order))

const names = computed<Record<BlockId, { n: string; d: string }>>(() => ({
  head: { n: t.value.blkHead, d: t.value.blkHeadD },
  pr: { n: t.value.blkPr, d: t.value.blkPrD },
  hero: { n: t.value.blkHero, d: t.value.blkHeroD },
  bar: { n: t.value.blkBar, d: t.value.blkBarD },
  chips: { n: t.value.blkChips, d: t.value.blkChipsD },
  stats: { n: t.value.blkStats, d: t.value.blkStatsD },
  pct: { n: t.value.blkPct, d: t.value.blkPctD },
}))
const hidden = (b: BlockId) => c.value.hidden.includes(b)
const go = (b: BlockId, d: -1 | 1) => (app.s.layout.custom.order = move(order.value, b, d))
const flip = (b: BlockId) => (app.s.layout.custom.hidden = toggle(c.value.hidden, b))
const reset = () => {
  const p = PRESET_LAYOUTS.complete
  app.s.layout.custom = { order: [...p.order], hidden: [...p.hidden], size: p.size }
}
const sizes = computed<{ value: HeroSize; label: string }[]>(() => [
  { value: 'normal', label: t.value.sizeNormal },
  { value: 'large', label: t.value.sizeLarge },
  { value: 'huge', label: t.value.sizeHuge },
])
</script>

<template>
  <Sheet :title="t.layCustom" @close="ui.open.layoutEdit = false">
    <p class="lead">{{ t.layEditHint }}</p>
    <ul>
      <li v-for="(b, i) in order" :key="b" :class="{ off: hidden(b) }">
        <span class="n">{{ names[b].n }}<small>{{ hidden(b) ? t.layHidden : names[b].d }}</small></span>
        <button type="button" class="ib" :disabled="i === 0" :aria-label="`${t.layUpAria}: ${names[b].n}`" @click="go(b, -1)">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6" /></svg>
        </button>
        <button type="button" class="ib" :disabled="i === order.length - 1" :aria-label="`${t.layDownAria}: ${names[b].n}`" @click="go(b, 1)">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <button type="button" class="ib eye" :aria-pressed="!hidden(b)" :aria-label="`${hidden(b) ? t.layShowAria : t.layHideAria}: ${names[b].n}`" @click="flip(b)">
          <svg v-if="!hidden(b)" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
          <svg v-else aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
        </button>
      </li>
      <li class="fixed">
        <span class="n">{{ t.layFixed }}<small>{{ t.layFixedD }}</small></span>
        <span class="lock" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        </span>
      </li>
    </ul>

    <Section :title="t.laySize">
      <Seg :model-value="c.size" :options="sizes" @update:model-value="app.s.layout.custom.size = $event" />
    </Section>

    <button type="button" class="reset" @click="reset">{{ t.layReset }}</button>
  </Sheet>
</template>

<style scoped>
.lead {
  margin: 0;
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.25;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 56px;
  border-top: 1px solid var(--line);
}
li:last-child {
  border-bottom: 1px solid var(--line);
}
.n {
  flex: 1;
  min-width: 0;
  font-size: calc(19px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
}
.n small {
  display: block;
  margin-top: 1px;
  font-size: calc(14px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.02em;
}
li.off .n {
  color: var(--muted);
}
.fixed .n {
  color: var(--muted);
}
.ib {
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ib:disabled {
  color: var(--line2);
}
.eye {
  color: var(--accent);
}
li.off .eye {
  color: var(--muted);
}
.lock {
  flex: none;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}
.reset {
  height: 48px;
  border-radius: 10px;
  border: 1px solid var(--line2);
  background: transparent;
  color: var(--muted);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
</style>
