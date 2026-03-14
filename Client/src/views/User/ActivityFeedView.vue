<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import PostCard from '@/components/PostCard.vue'
import PostDetailModal from '@/components/modal/PostDetailModal.vue'
import type { Post } from '@/types/posts'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()

// ============================================================================
// FEED POSTS
// ============================================================================
const feedUserIds = computed(() => {
  if (!authStore.currentUser) return []
  return [authStore.currentUser.id, ...(authStore.currentUser.following ?? [])]
})

const feedPosts = computed(() => postsStore.getFeedPosts(feedUserIds.value))

function getUserById(userId: number) {
  return usersStore.users.find((u) => u.id === userId)
}

// ============================================================================
// PAGINATION
// ============================================================================
const PAGE_SIZE = 20
const visibleCount = ref(PAGE_SIZE)

const visiblePosts = computed(() => feedPosts.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < feedPosts.value.length)

function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, feedPosts.value.length)
}

// ============================================================================
// INFINITE SCROLL
// ============================================================================
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value) loadMore()
    },
    { threshold: 0.1 },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())

// ============================================================================
// POST DETAIL MODAL
// ============================================================================
const detailPost = ref<Post | null>(null)
const openCommentBox = ref(false)

function openDetail(post: Post) {
  openCommentBox.value = false
  detailPost.value = post
}

function openDetailWithComments(post: Post) {
  openCommentBox.value = true
  detailPost.value = post
}

function closeDetail() {
  detailPost.value = null
  openCommentBox.value = false
}

function isOwner(post: Post | null): boolean {
  if (!post) return false
  return authStore.currentUser?.id === post.userId
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

      <!-- Not Logged In -->
      <div v-if="!authStore.isLoggedIn" class="columns is-centered">
        <div class="column is-three-quarters">
          <div class="notification is-warning has-text-centered">
            <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
            Please log in to see your feed.
          </div>
        </div>
      </div>

      <!-- Feed Content -->
      <div v-else>
        <!-- Empty state -->
        <div v-if="feedPosts.length === 0" class="columns is-centered">
          <div class="column is-three-quarters">
            <div class="notification is-info is-light has-text-centered">
              <span class="icon"><i class="fas fa-info-circle"></i></span>
              No activities yet. Start tracking or follow some friends!
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div v-else class="columns is-centered">
          <div class="column is-three-quarters">
            <div v-for="post in visiblePosts" :key="post.id" class="post-wrapper">
              <div class="post-click-area" @click="openDetail(post)">
                <PostCard
                  :post="post"
                  :author="getUserById(post.userId)"
                  :show-author="true"
                  @open-comments="openDetailWithComments(post)"
                />
              </div>
            </div>

            <!-- Sentinel -->
            <div ref="sentinel" class="sentinel" />

            <!-- Loading spinner -->
            <div v-if="hasMore" class="has-text-centered py-4">
              <span class="icon has-text-grey"><i class="fas fa-spinner fa-pulse"></i></span>
              <p class="has-text-grey is-size-7 mt-1">Loading more…</p>
            </div>

            <!-- All loaded -->
            <div v-else-if="feedPosts.length > PAGE_SIZE" class="has-text-centered py-4">
              <p class="has-text-grey is-size-7">
                <span class="icon is-small"><i class="fas fa-check-circle"></i></span>
                All {{ feedPosts.length }} posts loaded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <PostDetailModal
      :post="detailPost"
      :is-open="detailPost !== null"
      :is-owner="!!detailPost && isOwner(detailPost)"
      :open-comment-box="openCommentBox"
      @close="closeDetail"
    />
  </main>
</template>

<style scoped>
.sentinel {
  height: 1px;
}

.post-wrapper {
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.post-click-area {
  cursor: pointer;
}

.post-click-area:hover .card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>
