<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY >= window.innerHeight
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <transition name="fade">
    <button
      v-if="visible"
      class="button is-dark is-rounded back-to-top"
      aria-label="Back to top"
      @click="scrollToTop"
    >
      <span class="icon">
        <i class="fas fa-chevron-up"></i>
      </span>
    </button>
  </transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 50;
  opacity: 0.85;
}
.back-to-top:hover {
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
