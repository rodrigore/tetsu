<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import { resolve, type LayoutId } from '../core/layout'
import Sheet from './Sheet.vue'
import LayoutPreview from './LayoutPreview.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))

const items = computed(() => [
  { id: 'simple' as LayoutId, title: t.value.laySimple, desc: t.value.laySimpleD },
  { id: 'complete' as LayoutId, title: t.value.layComplete, desc: t.value.layCompleteD },
  { id: 'onehand' as LayoutId, title: t.value.layOne, desc: t.value.layOneD },
  { id: 'custom' as LayoutId, title: t.value.layCustom, desc: t.value.layCustomD },
])
const pick = (id: LayoutId) => (app.s.layout.id = id)
/** Editing starts from what is on screen now, so nothing jumps. */
function edit() {
  if (app.s.layout.id !== 'custom') {
    const r = resolve(app.s.layout)
    app.s.layout.custom = { order: [...r.order], hidden: [...r.hidden], size: r.size }
    app.s.layout.id = 'custom'
  }
  ui.open.layoutEdit = true
}
const preview = (id: LayoutId) => ({ id, custom: app.s.layout.custom })
</script>

<template>
  <Sheet :title="t.layTitle" @close="ui.open.layout = false">
    <p class="lead">{{ t.layHint }}</p>
    <div class="opts" role="radiogroup" :aria-label="t.layTitle">
      <button v-for="it in items" :key="it.id" type="button" role="radio" class="opt" :class="{ on: app.s.layout.id === it.id }" :aria-checked="app.s.layout.id === it.id" @click="pick(it.id)">
        <span class="mini" aria-hidden="true"><LayoutPreview :layout="preview(it.id)" /></span>
        <span class="tx"><span class="tt">{{ it.title }}</span><span class="ss">{{ it.desc }}</span></span>
        <i class="dot" aria-hidden="true" />
      </button>
    </div>
    <button type="button" class="wide" @click="edit">{{ t.layEdit }}</button>
    <p class="note">{{ t.layLandscape }}</p>
  </Sheet>
</template>

<style scoped>
.lead,
.note {
  margin: 0;
  font-size: calc(17px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.3;
}
.note {
  font-size: calc(15px * var(--ts));
}
.opts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.opt {
  min-height: 104px;
  padding: 10px 14px 10px 10px;
  border-radius: 12px;
  border: 1px solid var(--line2);
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}
.opt.on {
  border: 2px solid var(--accent);
  padding: 9px 13px 9px 9px;
  background: var(--surface);
}
.mini {
  flex: none;
  width: 68px;
  height: 122px;
  overflow: hidden;
  pointer-events: none;
}
.mini :deep(.phone) {
  zoom: 0.45;
}
.tx {
  flex: 1;
  min-width: 0;
}
.tt {
  display: block;
  font-size: calc(23px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
}
.ss {
  display: block;
  margin-top: 2px;
  font-size: calc(16px * var(--ts));
  font-weight: 500;
  color: var(--muted);
  line-height: 1.25;
}
.dot {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--line2);
  box-sizing: border-box;
}
.on .dot {
  border-color: var(--accent);
  background: radial-gradient(var(--accent) 0 40%, transparent 45%);
}
.wide {
  height: 52px;
  border-radius: 10px;
  border: 1px solid var(--line2);
  background: transparent;
  color: var(--text);
  font-size: calc(17px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
}
</style>
