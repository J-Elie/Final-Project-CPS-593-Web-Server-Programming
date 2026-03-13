<script setup lang="ts">
/**
 * AddButton.vue
 * =============
 * A reusable add button component with Bulma styling.
 */

defineEmits<{
  click: []
}>()

defineProps<{
  label?: string
  icon?: string
}>()
</script>

<template>
  <button class="button is-info is-outlined add-btn" @click="$emit('click')">
    <span class="icon"><i :class="icon || 'fas fa-plus'"></i></span>
    <span>{{ label || 'Add' }}</span>
  </button>
</template>

<style>
.add-btn {
  background-color: #f5f5f5 !important;
}

.add-btn:hover {
  background-color: #3e8ed0 !important;
  color: #fff !important;
}

[data-theme='dark'] .add-btn {
  background-color: #4a4a4a !important;
  border-color: #3e8ed0 !important;
  color: #3e8ed0 !important;
}

[data-theme='dark'] .add-btn:hover {
  background-color: #3e8ed0 !important;
  color: #fff !important;
}
</style>
