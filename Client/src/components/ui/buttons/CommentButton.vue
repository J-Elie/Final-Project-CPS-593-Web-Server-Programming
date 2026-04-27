<script setup lang="ts">
defineProps<{
  count: number
  hasCommented?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <component
    :is="readonly ? 'span' : 'a'"
    class="level-item like-button"
    @click="!readonly && emit('click')"
  >
    <span class="icon is-small" :class="hasCommented ? 'has-text-success' : 'has-text-info'">
      <i class="fas fa-comment"></i>
    </span>
    <span
      class="ml-1"
      :class="[hasCommented ? 'has-text-success' : '', readonly ? 'is-size-7' : '']"
      >{{ count }}</span
    >
  </component>
</template>
