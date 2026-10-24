<script setup lang="ts">
import { useApp } from '../stores/app'

const app = useApp()
</script>

<template>
  <div class="phone" :class="{ one: app.s.oneHand, minimal: app.s.look === 'minimal' }" role="img" :aria-label="app.s.oneHand ? 'Una mano' : 'Normal'">
    <div class="blk head"><i /><i /></div>
    <div class="blk lifts"><i class="on" /><i /><i /></div>
    <div class="blk pr"><i /><b /></div>
    <div class="blk hero"><i /><i class="big" /></div>
    <div class="blk bar"><span class="rod" /><span class="pl p1" /><span class="pl p2" /><span class="pl p3" /></div>
    <div v-if="app.s.look === 'full'" class="blk chips"><i /><i /><i /></div>
    <div v-if="app.s.look === 'full'" class="blk strip"><i /><i /><i /></div>
    <div class="blk pct"><i class="num" /><span class="dial" /></div>
    <span class="thumb" aria-hidden="true" />
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
.head { order: 0; }
.lifts { order: 1; }
.pr { order: 2; }
.hero { order: 3; }
.bar { order: 4; flex: 1; position: relative; min-height: 40px; }
.chips { order: 6; }
.strip { order: 7; }
.pct { order: 8; }
.one .hero { order: 0; }
.one .bar { order: 1; }
.one .chips { order: 3; }
.one .strip { order: 4; }
.one .head { order: 5; }
.one .lifts { order: 6; }
.one .pr { order: 7; }
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
