<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'
import { clock } from '../core/rest'
import TimeWheelSheet from './TimeWheelSheet.vue'

/** The rest length as a tappable row; the wheels open in a panel. */
const model = defineModel<number>({ required: true })
const app = useApp()
const t = computed(() => messages(app.s.lang))
const open = ref(false)
</script>

<template>
  <button type="button" class="row" :aria-label="`${t.trRest}: ${clock(model)}`" @click="open = true">
    <span class="v display">{{ clock(model) }}</span>
    <span class="c">{{ t.trAdjust }}</span>
  </button>
  <TimeWheelSheet v-if="open" v-model="model" :title="t.trRest" @close="open = false" />
</template>

<style scoped>
.row { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line2); background: var(--surface); color: var(--text); }
.v { font-size: 38px; line-height: 1; }
.c { font-size: calc(15px * var(--ts)); font-weight: 700; letter-spacing: 0.1em; color: var(--accent); }
</style>
