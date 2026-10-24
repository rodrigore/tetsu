<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../stores/app'
import { useUi } from '../stores/ui'
import { messages } from '../core/i18n'
import LiftsEditor from './LiftsEditor.vue'
import Sheet from './Sheet.vue'

const app = useApp()
const ui = useUi()
const t = computed(() => messages(app.s.lang))
</script>

<template>
  <Sheet :title="t.liftsTitle" @close="ui.open.lifts = false">
    <LiftsEditor />
  </Sheet>
</template>
