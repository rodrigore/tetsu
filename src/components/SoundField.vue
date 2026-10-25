<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'
import { soundOf } from '../core/sounds'
import SoundSheet from './SoundSheet.vue'

/** The chosen sound as a tappable row; the gallery opens in a panel. */
const app = useApp()
const t = computed(() => messages(app.s.lang))
const open = ref(false)
const name = computed(() => soundOf(app.s.plan.tone).name[app.s.lang])
</script>

<template>
  <button type="button" class="row" :aria-label="`${t.sndLabel}: ${name}`" @click="open = true">
    <span class="k">{{ t.sndLabel }}</span>
    <span class="n">{{ name }}</span>
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
  </button>
  <SoundSheet v-if="open" @close="open = false" />
</template>

<style scoped>
.row { display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line2); background: var(--surface); color: var(--text); text-align: left; }
.k { font-size: calc(13px * var(--ts)); font-weight: 600; letter-spacing: 0.14em; color: var(--muted); }
.n { flex: 1; font-size: calc(18px * var(--ts)); font-weight: 700; letter-spacing: 0.08em; color: var(--accent); text-align: right; }
.row svg { flex: none; color: var(--muted); }
</style>
