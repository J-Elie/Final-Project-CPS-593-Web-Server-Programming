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
  label?: string
  icon?: string
}>()
</script>

<template>
  <button
    class="button is-link is-outlined edit-btn"
    :class="{ 'is-small': small }"
    @click="$emit('click')"
  >
    <span class="icon"><i :class="icon || 'fas fa-edit'"></i></span>
    <span>{{ label || 'Edit' }}</span>
  </button>
</template>

<style>
.edit-btn {
  background-color: #f5f5f5 !important;
  border-color: hsl(var(--bulma-link-h), var(--bulma-link-s), var(--bulma-link-l)) !important;
  color: hsl(var(--bulma-link-h), var(--bulma-link-s), var(--bulma-link-l)) !important;
  font-weight: 600 !important;
}

.edit-btn:hover {
  background-color: hsl(var(--bulma-link-h), var(--bulma-link-s), var(--bulma-link-l)) !important;
  color: #fff !important;
}

[data-theme='dark'] .edit-btn {
  background-color: #4a4a4a !important;
  border-color: hsl(
    var(--bulma-link-h),
    var(--bulma-link-s),
    calc(var(--bulma-link-l) + 20%)
  ) !important;
  color: hsl(var(--bulma-link-h), var(--bulma-link-s), calc(var(--bulma-link-l) + 20%)) !important;
}

[data-theme='dark'] .edit-btn:hover {
  background-color: hsl(
    var(--bulma-link-h),
    var(--bulma-link-s),
    calc(var(--bulma-link-l) + 20%)
  ) !important;
  color: #fff !important;
}
</style>
