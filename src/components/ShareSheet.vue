<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { useToast } from '../stores/toast'
import { fmtW } from '../core/format'
import { messages } from '../core/i18n'
import { PALETTES } from '../core/palette'
import {
  buildCardData,
  cardBlob,
  cardFileName,
  formatOf,
  loadCardFonts,
  TEMPLATES,
  templatesFor,
  type CardFormat,
  type CardStyle,
} from '../core/shareCard'
import { useLoad } from '../core/useLoad'
import CardCanvas from './CardCanvas.vue'

const emit = defineEmits<{ text: [] }>()
const app = useApp()
const ui = useUi()
const toast = useToast()
const t = computed(() => messages(app.s.lang))
const { plates, barKg, mode } = useLoad(() => false)

const data = computed(() =>
  buildCardData({
    lang: app.s.lang,
    unit: app.s.unit,
    side: app.s.side,
    olympic: app.s.olympic,
    liftName: app.liftName(app.lift),
    pct: app.s.pct,
    prKg: app.lift.kg,
    barLabel: `${fmtW(app.bar.value, app.s.lang)} ${app.bar.unit.toUpperCase()}`,
    warm: app.s.warm,
    date: new Date(),
    url: 'rodrigore.github.io/tetsu',
    base: { barKg: barKg.value, collarKg: app.s.collarKg, plates: plates.value, mode: mode.value },
    pr: ui.prCard ?? undefined,
  }),
)

// A new record has its own card; the usual choices of template and format do not apply.
const prMode = computed(() => !!ui.prCard)
const current = computed<CardStyle['template']>(() => (prMode.value ? 'nuevopr' : app.s.share.template))
const style = computed<CardStyle>(() => ({ ...app.s.share, template: current.value, accent: app.s.share.accent || app.s.accent }))
const format = computed<CardFormat>(() => formatOf(current.value))
const list = computed(() => (prMode.value ? TEMPLATES.filter((x) => x.id === 'nuevopr') : templatesFor(format.value)))
const lastOf = { story: 'serie', square: 'compacta' } as Record<CardFormat, CardStyle['template']>
const setFormat = (f: CardFormat) => {
  if (f === format.value) return
  lastOf[format.value] = app.s.share.template
  app.s.share.template = lastOf[f]
}
const accent = computed(() => app.s.share.accent || app.s.accent)

const strip = ref<HTMLElement>()
const centre = (tpl: string) =>
  nextTick(() => strip.value?.querySelector<HTMLElement>(`[data-t="${tpl}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }))
const pick = (tpl: CardStyle['template']) => {
  app.s.share.template = tpl
  centre(tpl)
}
const pickAccent = (hex: string) => (app.s.share.accent = hex)
const light = computed(() => app.s.share.tone === 'light')
const busy = ref(false)

const close = () => {
  ui.open.share = false
  ui.prCard = null
}
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
onMounted(() => {
  window.addEventListener('keydown', onKey)
  centre(current.value)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const fileName = computed(() => cardFileName({ liftName: data.value.liftName, totalKg: ui.prCard?.newKg ?? data.value.totalKg }))

async function makeBlob(): Promise<Blob> {
  await loadCardFonts()
  return cardBlob(data.value, style.value, 3)
}

function download(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.value
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

async function run(fn: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  try {
    await fn()
  } catch (e) {
    if ((e as DOMException)?.name !== 'AbortError') toast.show(t.value.imageFailed)
  } finally {
    busy.value = false
  }
}

const save = () =>
  run(async () => {
    download(await makeBlob())
    toast.show(t.value.imageSaved)
  })

const copy = () =>
  run(async () => {
    // Safari only allows the clipboard inside the tap, so hand it the promise.
    const blob = makeBlob()
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    toast.show(t.value.imageCopied)
  })

const share = () =>
  run(async () => {
    const blob = await makeBlob()
    const file = new File([blob], fileName.value, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] })
      return
    }
    // No file sharing here (desktop browsers): fall back to saving it.
    download(blob)
    toast.show(t.value.imageSaved)
  })

const textOnly = () => {
  close()
  emit('text')
}
</script>

<template>
  <div class="scrim" @click.self="close">
    <section class="panel" role="dialog" aria-modal="true" :aria-label="t.shareTitle">
      <div class="grab" aria-hidden="true" />
      <header>
        <h2 class="display">{{ prMode ? t.newPr : t.shareTitle }}</h2>
        <button type="button" class="x" :aria-label="t.done" @click="close">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>

      <div v-if="!prMode" class="seg" role="group">
        <button type="button" :class="{ on: format === 'story' }" :aria-pressed="format === 'story'" @click="setFormat('story')">{{ t.fmtStory }}</button>
        <button type="button" :class="{ on: format === 'square' }" :aria-pressed="format === 'square'" @click="setFormat('square')">{{ t.fmtSquare }}</button>
      </div>

      <div ref="strip" class="strip hide-scroll" :class="format">
        <button
          v-for="tp in list"
          :key="tp.id"
          type="button"
          class="item"
          :class="{ on: current === tp.id, photo: tp.id === 'foto' }"
          :data-t="tp.id"
          :aria-label="tp.name[app.s.lang]"
          :aria-pressed="current === tp.id"
          @click="pick(tp.id)"
        >
          <CardCanvas :data="data" :cstyle="{ ...style, template: tp.id }" />
        </button>
      </div>
      <div class="cap">
        <span class="name display">{{ list.find((x) => x.id === current)?.name[app.s.lang] }}</span>
        <span class="dots" aria-hidden="true">
          <i v-for="tp in list" :key="tp.id" :class="{ on: tp.id === current }" />
        </span>
      </div>

      <div class="colors">
        <span class="lbl">{{ t.cardColor }}</span>
        <div class="sw hide-scroll" role="group" :aria-label="t.cardColor">
          <button
            v-for="p in PALETTES"
            :key="p.id"
            type="button"
            :aria-label="p.name[app.s.lang]"
            :aria-pressed="accent.toLowerCase() === p.accent.toLowerCase()"
            @click="pickAccent(p.accent)"
          >
            <span class="dot" :class="{ on: accent.toLowerCase() === p.accent.toLowerCase() }" :style="{ background: p.accent }" />
          </button>
          <button type="button" :aria-label="t.colorLight" :aria-pressed="light" @click="app.s.share.tone = light ? 'dark' : 'light'">
            <span class="dot paper" :class="{ on: light }" />
          </button>
        </div>
      </div>

      <div class="toggles">
        <button v-if="!prMode" type="button" :class="{ on: app.s.share.plates }" :aria-pressed="app.s.share.plates" @click="app.s.share.plates = !app.s.share.plates">{{ t.showPlates }}</button>
        <button type="button" :class="{ on: app.s.share.date }" :aria-pressed="app.s.share.date" @click="app.s.share.date = !app.s.share.date">{{ t.showDate }}</button>
        <button type="button" :class="{ on: app.s.share.link }" :aria-pressed="app.s.share.link" @click="app.s.share.link = !app.s.share.link">{{ t.showLink }}</button>
      </div>

      <div class="acts">
        <button type="button" :disabled="busy" @click="save">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" /></svg>
          {{ t.saveImage }}
        </button>
        <button type="button" :disabled="busy" @click="copy">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
          {{ t.copyImage }}
        </button>
        <button type="button" class="main" :disabled="busy" @click="share">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3" /><path d="M8.5 6.5L12 3l3.5 3.5" /><path d="M7 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1" /></svg>
          {{ t.shareImage }}
        </button>
      </div>
      <button v-if="!prMode" type="button" class="txt" @click="textOnly">{{ t.shareTextOnly }}</button>
    </section>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.panel {
  width: 100%;
  max-width: 480px;
  max-height: 96dvh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0 20px max(18px, env(safe-area-inset-bottom));
  background: var(--surface);
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 22px 22px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.grab {
  flex: none;
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: var(--line2);
  margin: 10px auto 0;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
}
h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1;
}
.x {
  width: 44px;
  height: 44px;
  margin-right: -10px;
  border: 0;
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.seg {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--bg);
  border-radius: 11px;
}
.seg button {
  flex: 1;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.06em;
}
.seg button.on {
  background: var(--text);
  color: var(--bg);
}
.strip {
  --ch: clamp(210px, 38dvh, 340px);
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin: 4px -20px 0;
  padding: 6px 20px;
  scroll-snap-type: x mandatory;
}
.item {
  flex: none;
  height: var(--ch);
  aspect-ratio: 9 / 16;
  padding: 0;
  border: 0;
  border-radius: 12px;
  overflow: hidden;
  scroll-snap-align: center;
  opacity: 0.6;
  background: transparent;
  box-shadow: 0 0 0 1px var(--line);
}
.strip.square .item {
  height: auto;
  width: calc(var(--ch) * 0.72);
  aspect-ratio: 1;
}
.item.on {
  opacity: 1;
  box-shadow: 0 0 0 2px var(--accent);
}
.item.photo {
  background: repeating-conic-gradient(#3a3a40 0 25%, #2a2a2e 0 50%) 0 0 / 16px 16px;
}
.cap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 30px;
}
.name {
  font-size: 20px;
  letter-spacing: 0.06em;
}
.dots {
  display: flex;
  gap: 5px;
  align-items: center;
}
.dots i {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: var(--line2);
}
.dots i.on {
  width: 18px;
  background: var(--accent);
}
.colors {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
}
.lbl {
  flex: none;
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--muted);
}
.sw {
  display: flex;
  overflow-x: auto;
  margin-right: -20px;
  padding-right: 20px;
}
.sw button {
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot {
  width: 26px;
  height: 26px;
  border-radius: 13px;
  box-sizing: border-box;
}
.dot.on {
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text);
}
.dot.paper {
  background: #f2eee6;
  border: 1px solid var(--line2);
}
.toggles {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.toggles button {
  height: 40px;
  padding: 0 14px;
  border-radius: 20px;
  border: 1px solid var(--line2);
  background: transparent;
  color: var(--muted);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.04em;
}
.toggles button.on {
  border-color: var(--accent);
  color: var(--text);
}
.acts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}
.acts button {
  height: 68px;
  border-radius: 12px;
  border: 1px solid var(--line2);
  background: var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: calc(14px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.04em;
}
.acts button.main {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on);
}
.acts button:disabled {
  opacity: 0.55;
}
.txt {
  height: 44px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: calc(15px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
