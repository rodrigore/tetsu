<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { loadCardFonts, renderCard, type CardData, type CardStyle } from '../core/shareCard'

const props = defineProps<{ data: CardData; cstyle: CardStyle; scale?: number }>()
const el = ref<HTMLCanvasElement>()
let ready = false

function draw() {
  if (el.value && ready) renderCard(el.value, props.data, props.cstyle, props.scale ?? 1.5)
}

onMounted(async () => {
  await loadCardFonts()
  ready = true
  draw()
})
watch(() => [props.data, props.cstyle], draw, { deep: true })
</script>

<template>
  <canvas ref="el" class="card" />
</template>

<style scoped>
.card {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
