<script setup lang="ts">
/**
 * EditButton.vue
 * ==============
 * A reusable edit button component with Bulma styling.
 */

defineEmits<{
  click: []
}>()

defineProps<{
  small?: boolean
}>()
</script>

<template>
  <button
    class="button is-link is-outlined edit-btn"
    :class="{ 'is-small': small }"
    @click="$emit('click')"
  >
    <span class="icon"><i class="fas fa-edit"></i></span>
    <span>Edit</span>
  </button>
</template>

<style>
.edit-btn {
  background-color: #f5f5f5 !important;
}

.edit-btn:hover {
  background-color: #485fc7 !important;
  color: #fff !important;
}

[data-theme='dark'] .edit-btn {
  background-color: #4a4a4a !important;
  border-color: #485fc7 !important;
  color: #7b9cff !important;
}

[data-theme='dark'] .edit-btn:hover {
  background-color: #485fc7 !important;
  color: #fff !important;
}
</style>
