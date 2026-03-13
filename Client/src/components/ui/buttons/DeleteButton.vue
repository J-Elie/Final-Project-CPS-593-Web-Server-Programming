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
    <span class="icon"><i class="fas fa-trash"></i></span>
    <span>Delete</span>
  </button>
</template>

<style>
.delete-btn {
  background-color: #f5f5f5 !important;
}

.delete-btn:hover {
  background-color: #363636 !important;
  color: #fff !important;
}

[data-theme='dark'] .delete-btn {
  background-color: #4a4a4a !important;
  border-color: #dbdbdb !important;
  color: #dbdbdb !important;
}

[data-theme='dark'] .delete-btn:hover {
  background-color: #5a5a5a !important;
}
</style>
