<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useApp } from '../stores/app'
import { messages } from '../core/i18n'
import { clampRest, MIN_REST, splitRest } from '../core/rest'
import WheelColumn from './WheelColumn.vue'

/** A bottom panel with minute and second wheels. Applies on the button; tapping outside cancels. */
const props = defineProps<{ modelValue: number; title: string; cta?: string }>()
const emit = defineEmits<{ 'update:modelValue': [sec: number]; close: [] }>()
const app = useApp()
const t = computed(() => messages(app.s.lang))

const m = ref(splitRest(props.modelValue).m)
const s = ref(splitRest(props.modelValue).s)
const total = computed(() => clampRest(m.value * 60 + s.value))
const tooShort = computed(() => m.value * 60 + s.value < MIN_REST)

const apply = () => {
  emit('update:modelValue', total.value)
  emit('close')
}
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="scrim" @click.self="emit('close')">
    <section class="panel" role="dialog" aria-modal="true" :aria-label="title">
      <div class="grab" aria-hidden="true" />
      <h2 class="display">{{ title }}</h2>
      <div class="wheels">
        <WheelColumn v-model="m" :count="60" :label="t.wheelMin" :aria="t.trMin" />
        <WheelColumn v-model="s" :count="60" :label="t.wheelSec" :aria="t.trSec" />
      </div>
      <p v-if="tooShort" class="min">{{ t.wheelMinHint }}</p>
      <button type="button" class="go" @click="apply">{{ cta ?? t.done }}</button>
    </section>
  </div>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; z-index: 30; background: rgba(0, 0, 0, 0.6); display: flex; align-items: flex-end; justify-content: center; }
.panel { width: 100%; max-width: 480px; box-sizing: border-box; padding: 0 24px max(18px, env(safe-area-inset-bottom)); background: var(--surface); border: 1px solid var(--line); border-bottom: 0; border-radius: 22px 22px 0 0; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.grab { width: 40px; height: 5px; border-radius: 3px; background: var(--line2); margin: 10px 0 0; }
h2 { margin: 0; font-size: 26px; font-weight: 400; letter-spacing: 0.04em; }
.wheels { display: flex; justify-content: center; gap: 28px; padding-left: 8px; }
.min { margin: 0; font-size: calc(14px * var(--ts)); color: var(--muted); }
.go { align-self: stretch; height: 54px; border-radius: 10px; border: 0; background: var(--accent); color: var(--on); font-size: calc(18px * var(--ts)); font-weight: 700; letter-spacing: 0.1em; }
</style>
