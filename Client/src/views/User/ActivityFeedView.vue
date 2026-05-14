<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import { useSessionStore } from '@/stores/session'
import PostCard from '@/components/PostCard.vue'
import PostDetailModal from '@/components/modal/PostDetailModal.vue'
import type { Post } from '../../../../Server/Types/posts'
import type { DataListEnvelope } from '../../../../Server/Types/dataEnvelopes'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()
const sessionStore = useSessionStore()

// ============================================================================
// INFINITE SCROLL STATE
// ============================================================================
const PAGE_SIZE = 5

const feedPosts = ref<Post[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const isLoadingMore = ref(false)
const allLoaded = ref(false)

const feedUserIds = computed(() => {
  if (!authStore.currentUser) return []
  return [authStore.currentUser.id, ...(authStore.currentUser.following ?? [])]
})

function getUserById(userId: number) {
  return usersStore.users.find((u) => u.id === userId)
}

async function loadNextPage() {
  if (isLoadingMore.value || allLoaded.value || feedUserIds.value.length === 0) return

  isLoadingMore.value = true
  try {
    // Build query string manually — URLSearchParams encodes commas as %2C which
    // some server query parsers don't split correctly.
    const validIds = feedUserIds.value.filter((id) => Number.isInteger(id) && id > 0)
    const qs = `userIds=${validIds.join(',')}&page=${currentPage.value}&pageSize=${PAGE_SIZE}`
    const result = await sessionStore.api<DataListEnvelope<Post>>(`posts/feed?${qs}`)
    feedPosts.value.push(...result.data)
    totalCount.value = result.total
    if (feedPosts.value.length >= result.total || result.data.length === 0) {
      allLoaded.value = true
    } else {
      currentPage.value++
    }
  } finally {
    isLoadingMore.value = false
  }
}

// Reset and reload when the logged-in user changes
watch(
  feedUserIds,
  async (ids) => {
    if (ids.length === 0) return
    feedPosts.value = []
    totalCount.value = 0
    currentPage.value = 1
    allLoaded.value = false
    await loadNextPage()
  },
  { immediate: true },
)

// ============================================================================
// INFINITE SCROLL — VueUse useInfiniteScroll
// ============================================================================
// The page scrolls on window (not on a child element), so we target window.
useInfiniteScroll(
  window,
  async () => {
    await loadNextPage()
  },
  { distance: 300, canLoadMore: () => !allLoaded.value },
)

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

// Keep postsStore in sync so other views (likes, comments, etc.) still work
function syncToStore(posts: Post[]) {
  for (const post of posts) {
    const idx = postsStore.posts.findIndex((p) => p.id === post.id)
    if (idx === -1) postsStore.posts.push(post)
  }
}
watch(feedPosts, syncToStore, { deep: false })
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
        <!-- Empty state (after first load, nothing found) -->
        <div
          v-if="!isLoadingMore && feedPosts.length === 0 && allLoaded"
          class="columns is-centered"
        >
          <div class="column is-three-quarters">
            <div class="notification is-info is-light has-text-centered">
              <span class="icon"><i class="fas fa-info-circle"></i></span>
              No activities yet. Start tracking or follow some friends!
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div class="columns is-centered">
          <div class="column is-three-quarters">


            <div v-for="post in feedPosts" :key="post.id" class="post-wrapper">
              <div class="post-click-area" @click="openDetail(post)">
                <PostCard
                  :post="post"
                  :author="getUserById(post.userId)"
                  :show-author="true"
                  @open-comments="openDetailWithComments(post)"
                />
              </div>
            </div>

            <!-- Skeleton loading cards (shown while fetching next batch) -->
            <div v-if="isLoadingMore">
              <div v-for="n in PAGE_SIZE" :key="'skel-' + n" class="card mb-3 skeleton-card">
                <div class="card-content">
                  <div class="media mb-3">
                    <div class="media-left">
                      <div
                        class="skeleton-block"
                        style="width: 48px; height: 48px; border-radius: 50%"
                      ></div>
                    </div>
                    <div class="media-content">
                      <div class="skeleton-lines">
                        <div class="skeleton-block mb-2" style="width: 40%; height: 14px"></div>
                        <div class="skeleton-block" style="width: 25%; height: 12px"></div>
                      </div>
                    </div>
                  </div>
                  <div class="skeleton-block mb-2" style="width: 70%; height: 18px"></div>
                  <div class="skeleton-block mb-1" style="width: 100%; height: 12px"></div>
                  <div class="skeleton-block" style="width: 85%; height: 12px"></div>
                </div>
              </div>
            </div>

            <!-- All loaded indicator -->
            <div v-if="allLoaded && feedPosts.length > 0" class="has-text-centered py-4">
              <span class="tag is-success is-light">
                <span class="icon is-small"><i class="fas fa-check-circle"></i></span>
                <span>All {{ feedPosts.length }} posts loaded</span>
              </span>
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

    <!-- Fixed counter badge -->
    <div v-if="feedPosts.length > 0" class="feed-counter">
      {{ feedPosts.length }} / {{ totalCount }} posts
    </div>
  </main>
</template>

<style scoped>
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

/* Fixed counter badge */
.feed-counter {
  position: fixed;
  bottom: 1.25rem;
  left: 1.25rem;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.72rem;
  color: #888;
  pointer-events: none;
  z-index: 50;
  transition: opacity 0.3s;
}

/* Skeleton shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.skeleton-block {
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 4px;
  display: block;
}

.skeleton-card {
  border: 1px solid #ededed;
}
</style>
