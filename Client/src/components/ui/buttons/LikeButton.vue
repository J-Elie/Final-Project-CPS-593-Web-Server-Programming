<script setup lang="ts">
import type { User } from '../../../../../Server/Types/users'

defineProps<{
  count: number
  hasLiked?: boolean
  readonly?: boolean
  likedByUsers?: (User | null)[]
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="likes-hover-wrap">
    <component
      :is="readonly ? 'span' : 'a'"
      class="level-item like-button"
      @click="!readonly && emit('click')"
    >
      <span class="icon is-small" :class="hasLiked ? 'has-text-success' : 'has-text-info'">
        <i class="fas fa-heart"></i>
      </span>
      <span
        class="ml-1"
        :class="[hasLiked ? 'has-text-success' : 'has-text-info', readonly ? 'is-size-7' : '']"
      >
        {{ count }}
      </span>
    </component>

    <!-- Hover dropdown showing who liked -->
    <div v-if="likedByUsers !== undefined" class="likes-dropdown">
      <div class="dropdown-content likes-menu">
        <p class="dropdown-item has-text-grey heading mb-0">Liked by</p>
        <hr class="dropdown-divider mt-1 mb-1" />
        <div v-if="likedByUsers.length === 0" class="dropdown-item has-text-grey-light is-size-7">
          No likes yet.
        </div>
        <div
          v-for="user in likedByUsers"
          :key="user!.id"
          class="dropdown-item is-flex is-align-items-center"
          style="gap: 0.5rem; padding-top: 0.4rem; padding-bottom: 0.4rem"
        >
          <figure class="image is-24x24" style="flex-shrink: 0">
            <img
              v-if="user!.image"
              class="is-rounded"
              :src="user!.image"
              :alt="user!.firstName"
              style="width: 24px; height: 24px; object-fit: cover"
            />
            <span v-else class="icon has-text-grey-light" style="font-size: 1.5rem">
              <i class="fas fa-user-circle"></i>
            </span>
          </figure>
          <div>
            <p class="is-size-7 has-text-weight-semibold" style="line-height: 1.2">
              {{ user!.firstName }}
            </p>
            <p class="is-size-7 has-text-grey" style="line-height: 1.2">@{{ user!.username }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.likes-hover-wrap {
  position: relative;
  display: inline-block;
}

.likes-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  z-index: 40;
  min-width: 200px;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background-color: var(--bulma-scheme-main, #fff);
  border: 1px solid hsl(0, 0%, 90%);
}

.likes-hover-wrap:hover .likes-dropdown {
  display: block;
}

.likes-menu {
  max-height: 260px;
  overflow-y: auto;
  border-radius: 6px;
  background-color: var(--bulma-scheme-main, #fff);
}
</style>
