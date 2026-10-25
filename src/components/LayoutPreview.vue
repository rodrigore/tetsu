<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { placement, resolve, type BlockId, type LayoutSetting } from '../core/layout'

const props = defineProps<{ layout?: LayoutSetting; label?: string }>()
const app = useApp()
const place = computed(() => placement(resolve(props.layout ?? app.s.layout)))
const show = (b: BlockId) => place.value[b].show
const at = (b: BlockId, n = 0) => ({ order: place.value[b].rank * 10 + n })
const lowHead = computed(() => place.value.head.rank > place.value.hero.rank)
</script>

<template>
  <div class="phone" :class="{ one: lowHead }" role="img" :aria-label="label ?? ''">
    <template v-if="show('head')">
      <div class="blk head" :style="at('head')"><i /><i /></div>
      <div class="blk lifts" :style="at('head', 1)"><i class="on" /><i /><i /></div>
    </template>
    <div v-if="show('pr')" class="blk pr" :style="at('pr')"><i /><b /></div>
    <div v-if="show('hero')" class="blk hero" :style="at('hero')"><i /><i class="big" /></div>
    <div class="blk bar" :style="at('bar')"><span class="rod" /><span class="pl p1" /><span class="pl p2" /><span class="pl p3" /></div>
    <div v-if="show('chips')" class="blk chips" :style="at('chips')"><i /><i /><i /></div>
    <div v-if="show('stats')" class="blk strip" :style="at('stats')"><i /><i /><i /></div>
    <div v-if="show('pct')" class="blk pct" :style="at('pct')"><i class="num" /><span class="dial" /></div>
    <span v-if="lowHead" class="thumb" aria-hidden="true" />
  </div>
</template>

<style scoped>
.phone {
  position: relative;
  align-self: center;
  width: 150px;
  height: 270px;
  padding: 10px 9px;
  border: 2px solid var(--line2);
  border-radius: 18px;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}
.blk {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
  transition: order 0s;
}
.blk i,
.blk b {
  display: block;
  height: 8px;
  flex: 1;
  border-radius: 3px;
  background: var(--line2);
}
.bar { flex: 1; position: relative; min-height: 40px; }
.lifts i.on { background: var(--accent); }
.pr b { flex: 0 0 22px; background: var(--accent); opacity: 0.55; }
.hero { flex-direction: column; align-items: stretch; gap: 3px; }
.hero i { flex: none; height: 5px; width: 40%; }
.hero i.big { height: 20px; width: 80%; background: var(--text); border-radius: 3px; }
.rod {
  position: absolute;
  left: -9px;
  right: -9px;
  top: 50%;
  height: 5px;
  margin-top: -2px;
  background: var(--barc);
}
.pl {
  position: absolute;
  top: 50%;
  border-radius: 3px;
  transform: translateY(-50%);
}
.p1 { left: 44px; width: 11px; height: 38px; background: var(--text); }
.p2 { left: 58px; width: 9px; height: 30px; background: var(--collar); }
.p3 { left: 70px; width: 8px; height: 22px; background: var(--accent); }
.chips i { height: 9px; border-radius: 5px; }
.strip i { height: 12px; }
.pct { flex-direction: column; align-items: stretch; gap: 5px; }
.pct .num { flex: none; height: 14px; width: 45%; background: var(--text); }
.dial { display: block; height: 4px; border-radius: 2px; background: var(--accent); }
/* Where a right thumb reaches comfortably. */
.thumb {
  position: absolute;
  inset: auto 0 0 0;
  height: 38%;
  background: linear-gradient(to top, color-mix(in srgb, var(--accent) 22%, transparent), transparent);
  pointer-events: none;
}
</style>
