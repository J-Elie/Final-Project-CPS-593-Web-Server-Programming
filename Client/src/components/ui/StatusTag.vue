<script setup lang="ts">
/**
 * StatusTag.vue
 * =============
 * A reusable tag component with Bulma styling for displaying
 * roles, types, difficulty levels, and other status indicators.
 */

defineProps<{
  label: string
  variant?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light'
  size?: 'small' | 'medium' | 'large'
}>()

// Map variant to Bulma class
const variantClass = (variant?: string) => {
  switch (variant) {
    case 'primary':
      return 'is-primary'
    case 'link':
      return 'is-link'
    case 'info':
      return 'is-info'
    case 'success':
      return 'is-success'
    case 'warning':
      return 'is-warning'
    case 'danger':
      return 'is-danger'
    case 'dark':
      return 'is-dark'
    case 'light':
      return 'is-light'
    default:
      return 'is-info'
  }
}

const sizeClass = (size?: string) => {
  switch (size) {
    case 'small':
      return 'is-small'
    case 'medium':
      return 'is-medium'
    case 'large':
      return 'is-large'
    default:
      return ''
  }
}
</script>

<template>
  <span class="tag is-rounded" :class="[variantClass(variant), sizeClass(size)]">
    {{ label }}
  </span>
</template>
