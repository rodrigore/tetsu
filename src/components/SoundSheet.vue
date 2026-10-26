<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useApp } from '../stores/app'
import { testSound } from '../core/beep'
import { messages } from '../core/i18n'
import { SOUNDS, soundOf } from '../core/sounds'

/** The sound gallery: tap a sound to hear it and keep it. */
const emit = defineEmits<{ close: [] }>()
const app = useApp()
const t = computed(() => messages(app.s.lang))
const chosen = computed(() => soundOf(app.s.plan.tone).id)
const pick = (id: string) => {
  app.s.plan.tone = id
  testSound(id)
}
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="scrim" @click.self="emit('close')">
    <section class="panel" role="dialog" aria-modal="true" :aria-label="t.sndTitle">
      <div class="grab" aria-hidden="true" />
      <header>
        <h2 class="display">{{ t.sndTitle }}</h2>
        <button type="button" class="x" :aria-label="t.done" @click="emit('close')">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <ul role="radiogroup" :aria-label="t.sndTitle">
        <li v-for="s in SOUNDS" :key="s.id">
          <button type="button" role="radio" :aria-checked="chosen === s.id" :class="{ on: chosen === s.id }" @click="pick(s.id)">
            <span class="play" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg></span>
            <span class="txt"><b>{{ s.name[app.s.lang] }}</b><small>{{ s.desc[app.s.lang] }}</small></span>
            <span class="chk" aria-hidden="true"><svg v-if="chosen === s.id" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          </button>
        </li>
      </ul>
      <p class="hint">{{ t.trSilentHint }}</p>
    </section>
  </div>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; z-index: 30; background: rgba(0, 0, 0, 0.6); display: flex; align-items: flex-end; justify-content: center; }
.panel { width: 100%; max-width: 480px; max-height: 92dvh; overflow-y: auto; box-sizing: border-box; padding: 0 20px max(18px, env(safe-area-inset-bottom)); background: var(--surface); border: 1px solid var(--line); border-bottom: 0; border-radius: 22px 22px 0 0; display: flex; flex-direction: column; gap: 8px; }
.grab { flex: none; width: 40px; height: 5px; border-radius: 3px; background: var(--line2); margin: 10px auto 0; }
header { display: flex; align-items: center; justify-content: space-between; min-height: 48px; }
h2 { margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 0.04em; }
.x { width: 44px; height: 44px; border: 0; background: transparent; color: var(--text); display: flex; align-items: center; justify-content: center; }
ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li button { width: 100%; min-height: 64px; box-sizing: border-box; padding: 8px 14px; display: flex; align-items: center; gap: 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); color: var(--text); text-align: left; }
li button.on { border: 2px solid var(--accent); padding: 7px 13px; }
.play { flex: none; width: 40px; height: 40px; border-radius: 20px; background: var(--track); color: var(--accent); display: flex; align-items: center; justify-content: center; }
.txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.txt b { font-size: calc(19px * var(--ts)); letter-spacing: 0.08em; }
.txt small { font-size: calc(14px * var(--ts)); font-weight: 500; color: var(--muted); letter-spacing: 0.02em; }
.chk { flex: none; width: 24px; color: var(--accent); }
.hint { margin: 4px 0 0; font-size: calc(14px * var(--ts)); color: var(--muted); line-height: 1.3; }
</style>
