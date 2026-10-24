<script setup lang="ts" generic="T extends string | number | boolean">
defineProps<{ options: { value: T; label: string }[]; modelValue: T }>()
defineEmits<{ 'update:modelValue': [value: T] }>()
</script>

<template>
  <div class="seg">
    <button
      v-for="o in options"
      :key="String(o.value)"
      type="button"
      :class="{ on: o.value === modelValue }"
      :aria-pressed="o.value === modelValue"
      @click="$emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: flex;
  gap: 8px;
}
button {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: calc(16px * var(--ts));
  font-weight: 700;
  letter-spacing: 0.08em;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
}
button.on {
  background: var(--accent);
  color: var(--on);
  border-color: var(--accent);
}
</style>
