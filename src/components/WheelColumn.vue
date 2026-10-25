<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** A vertical wheel of 0..count-1 that snaps to a value, like the iPhone timer. */
const props = defineProps<{ modelValue: number; count: number; label: string; aria: string }>()
const emit = defineEmits<{ 'update:modelValue': [n: number] }>()

const H = 56
const el = ref<HTMLElement>()
const cur = ref(props.modelValue)
let settle: ReturnType<typeof setTimeout> | undefined

const index = () => Math.min(props.count - 1, Math.max(0, Math.round((el.value?.scrollTop ?? 0) / H)))
const pad = (n: number) => String(n).padStart(2, '0')

function onScroll() {
  cur.value = index()
  clearTimeout(settle)
  settle = setTimeout(() => cur.value !== props.modelValue && emit('update:modelValue', cur.value), 90)
}
const goto = (n: number, smooth = false) => el.value?.scrollTo({ top: n * H, behavior: smooth ? 'smooth' : 'auto' })
function step(d: number) {
  const n = Math.min(props.count - 1, Math.max(0, cur.value + d))
  cur.value = n
  goto(n, true)
  emit('update:modelValue', n)
}

onMounted(() => goto(props.modelValue))
onBeforeUnmount(() => clearTimeout(settle))
watch(() => props.modelValue, (v) => {
  if (v !== cur.value) {
    cur.value = v
    goto(v)
  }
})
</script>

<template>
  <div class="col">
    <span class="pill" aria-hidden="true" />
    <div
      ref="el"
      class="wheel hide-scroll"
      role="spinbutton"
      tabindex="0"
      :aria-label="aria"
      :aria-valuemin="0"
      :aria-valuemax="count - 1"
      :aria-valuenow="cur"
      @scroll.passive="onScroll"
      @keydown.up.prevent="step(-1)"
      @keydown.down.prevent="step(1)"
    >
      <div v-for="n in count" :key="n" class="it" :class="{ on: n - 1 === cur }" @click="goto(n - 1, true)">{{ pad(n - 1) }}</div>
    </div>
    <span class="lbl">{{ label }}</span>
  </div>
</template>

<style scoped>
.col { position: relative; display: flex; align-items: center; gap: 10px; }
.pill { position: absolute; left: 0; top: 50%; width: 112px; height: 80px; margin-top: -40px; border-radius: 40px; background: var(--track); }
.wheel {
  position: relative;
  width: 112px;
  height: 280px;
  box-sizing: border-box;
  padding: 112px 0;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-mask-image: linear-gradient(transparent, #000 32%, #000 68%, transparent);
  mask-image: linear-gradient(transparent, #000 32%, #000 68%, transparent);
  outline: none;
}
.wheel:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; border-radius: 40px; }
.it { height: 56px; scroll-snap-align: center; display: flex; align-items: center; justify-content: center; font-family: 'Anton', sans-serif; font-size: 50px; line-height: 1; color: var(--muted); opacity: 0.55; cursor: pointer; }
.it.on { color: var(--text); opacity: 1; }
.lbl { font-size: calc(20px * var(--ts)); font-weight: 700; letter-spacing: 0.06em; }
</style>
