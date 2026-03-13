<script setup lang="ts">
/**
 * UserListModal.vue
 * =================
 * Reusable modal that shows a list of users (followers or following).
 * Pass in a title and array of user IDs, it looks them up from the store.
 */

import { computed } from 'vue'
import { useUsersStore } from '@/stores/usersStores'

const props = defineProps<{
  title: string
  userIds: number[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const usersStore = useUsersStore()

const users = computed(() =>
  props.userIds.map((id) => usersStore.users.find((u) => u.id === id)).filter(Boolean),
)
</script>

<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span class="icon has-text-info"><i class="fas fa-users"></i></span>
          {{ title }}
        </p>
        <button class="delete" aria-label="close" @click="emit('close')"></button>
      </header>

      <section class="modal-card-body">
        <!-- Empty state -->
        <div v-if="users.length === 0" class="has-text-centered py-5">
          <span class="icon is-large has-text-grey-light">
            <i class="fas fa-user-slash fa-2x"></i>
          </span>
          <p class="has-text-grey mt-3">No users here yet.</p>
        </div>

        <!-- User list -->
        <div v-for="user in users" :key="user!.id" class="media user-row">
          <div class="media-left">
            <figure class="image is-48x48">
              <img
                v-if="user!.image"
                class="is-rounded"
                :src="user!.image"
                :alt="user!.firstName"
              />
              <span v-else class="icon has-text-grey-light" style="font-size: 3rem">
                <i class="fas fa-user-circle"></i>
              </span>
            </figure>
          </div>
          <div class="media-content">
            <p class="has-text-weight-semibold">{{ user!.firstName }}</p>
            <p class="has-text-grey is-size-7">@{{ user!.username }}</p>
          </div>
          <div class="media-right">
            <span class="tag is-info is-rounded is-small">{{ user!.role }}</span>
          </div>
        </div>
      </section>

      <footer class="modal-card-foot">
        <button class="button is-info is-outlined" @click="emit('close')">Close</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.user-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid hsl(0, 0%, 93%);
}
.user-row:last-child {
  border-bottom: none;
}
</style>
