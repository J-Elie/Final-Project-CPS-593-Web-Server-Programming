<script setup lang="ts">
/**
 * UserCard.vue
 * ============
 * Displays a single user with follow/unfollow, view profile, and see activities actions.
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/users'

const props = defineProps<{
  user: User
}>()

const authStore = useAuthStore()
const router = useRouter()

const isFollowing = computed(
  () => authStore.currentUser?.following?.includes(props.user.id) ?? false,
)

function toggleFollow() {
  if (!authStore.currentUser) return
  const following = [...(authStore.currentUser.following ?? [])]
  const idx = following.indexOf(props.user.id)
  if (idx === -1) {
    following.push(props.user.id)
  } else {
    following.splice(idx, 1)
  }
  authStore.currentUser = { ...authStore.currentUser, following }
}

// function viewProfile() {
//   router.push(`/User/Profile/${props.user.id}`)
// }

function viewActivities() {
  router.push(`/User/Activities/${props.user.id}`)
}
</script>

<template>
  <div class="box user-card">
    <div class="media">
      <!-- Avatar -->
      <div class="media-left">
        <figure class="image is-64x64">
          <img v-if="user.image" class="is-rounded" :src="user.image" :alt="user.firstName" />
          <span v-else class="icon has-text-grey-light" style="font-size: 4rem">
            <i class="fas fa-user-circle"></i>
          </span>
        </figure>
      </div>

      <!-- Info -->
      <div class="media-content">
        <p class="has-text-weight-bold is-size-6">{{ user.firstName }}</p>
        <p class="has-text-grey is-size-7">@{{ user.username }}</p>
        <span class="tag is-info is-rounded is-small mt-1">{{ user.role }}</span>
      </div>

      <!-- Actions -->
      <div class="media-right">
        <div class="buttons is-right">
          <button
            class="button is-small"
            :class="isFollowing ? 'is-info' : 'is-info is-outlined'"
            @click="toggleFollow"
          >
            <span class="icon">
              <i :class="isFollowing ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
            </span>
            <span>{{ isFollowing ? 'Following' : 'Follow' }}</span>
          </button>
          <button class="button is-success is-outlined is-small" @click="viewActivities">
            <span class="icon"><i class="fas fa-running"></i></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  transition: box-shadow 0.2s;
  margin-bottom: 0.75rem;
}
.user-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
