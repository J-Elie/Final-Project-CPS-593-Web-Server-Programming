<script setup lang="ts">
// ============================================================================
// IMPORTS
// ============================================================================
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import PostCard from '@/components/PostCard.vue'

// ============================================================================
// STORE INITIALIZATION
// ============================================================================
const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
/**
 * feedUserIds - Array of user IDs whose posts should appear in the feed
 * Includes the current user's ID plus all users they follow
 */
const feedUserIds = computed(() => {
  if (!authStore.currentUser) return []
  const ids = [authStore.currentUser.id]
  if (authStore.currentUser.following) {
    ids.push(...authStore.currentUser.following)
  }
  return ids
})

/**
 * feedPosts - All posts from the current user and users they follow
 * Sorted by date (newest first)
 */
const feedPosts = computed(() => {
  return postsStore.getFeedPosts(feedUserIds.value)
})

/**
 * getUserById - Helper to get user info for displaying post author
 */
function getUserById(userId: number) {
  return usersStore.users.find((u) => u.id === userId)
}
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Page Header -->
      <h1 class="title is-2 has-text-centered">
        <span class="icon-text is-justify-content-center">
          <span class="icon has-text-info mr-4">
            <i class="fas fa-users"></i>
          </span>
          <span>Activity Feed</span>
        </span>
      </h1>
      <p class="subtitle has-text-centered">See what you and your friends have been up to</p>

      <!-- Not Logged In Message -->
      <div v-if="!authStore.isLoggedIn" class="notification is-warning">
        <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
        Please log in to see your feed.
      </div>

      <!-- Feed Content -->
      <div v-else>
        <!-- Empty Feed Message -->
        <div v-if="feedPosts.length === 0" class="notification is-info is-light">
          <span class="icon"><i class="fas fa-info-circle"></i></span>
          No activities yet. Start tracking or follow some friends!
        </div>

        <!-- Posts List -->
        <div v-else class="columns is-centered">
          <div class="column is-three-quarters">
            <PostCard
              v-for="post in feedPosts"
              :key="post.id"
              :post="post"
              :author="getUserById(post.userId)"
              :show-author="true"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.posts-feed .box:hover {
  box-shadow:
    0 0.5em 1em -0.125em rgba(10, 10, 10, 0.15),
    0 0 0 1px rgba(10, 10, 10, 0.02);
}
</style>
