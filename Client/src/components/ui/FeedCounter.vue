<script setup lang="ts">
withDefaults(
  defineProps<{
    shown: number
    total: number
    label?: string
  }>(),
  { label: 'posts' },
)
</script>

<template>
  <div v-if="shown > 0" class="feed-counter">{{ shown }} / {{ total }} {{ label }}</div>
</template>

<style scoped>
.feed-counter {
  position: fixed;
  bottom: 1.25rem;
  left: 1.25rem;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  color: #888;
  pointer-events: none;
  z-index: 50;
}
</style>
