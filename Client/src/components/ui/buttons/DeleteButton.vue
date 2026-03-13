<script setup lang="ts">
/**
 * DeleteButton.vue
 * ================
 * A reusable delete button component with Bulma styling.
 */

defineEmits<{
  click: []
}>()

defineProps<{
  small?: boolean
  disabled?: boolean
  title?: string
  label?: string
  showIcon?: boolean
}>()
</script>

<template>
  <button
    class="button is-dark is-outlined delete-btn"
    :class="{ 'is-small': small }"
    :disabled="disabled"
    :title="title"
    @click="$emit('click')"
  >
    <span v-if="showIcon !== false" class="icon"><i class="fas fa-trash"></i></span>
    <span>{{ label ?? 'Delete' }}</span>
  </button>
</template>

<style>
/* Light mode — same pattern as AddButton */
.delete-btn {
  background-color: #f5f5f5 !important;
  border-color: #363636 !important;
  color: #363636 !important;
}

.delete-btn:hover {
  background-color: #363636 !important;
  border-color: #363636 !important;
  color: #fff !important;
}

/* Dark mode — lighter grey version of the same pattern */
[data-theme='dark'] .delete-btn {
  background-color: #4a4a4a !important;
  border-color: #b5b5b5 !important;
  color: #b5b5b5 !important;
}

[data-theme='dark'] .delete-btn:hover {
  background-color: #b5b5b5 !important;
  border-color: #b5b5b5 !important;
  color: #363636 !important;
}
</style>
