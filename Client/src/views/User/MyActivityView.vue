<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import type { Post } from '@/types/posts'
import PostCard from '@/components/PostCard.vue'
import AddButton from '@/components/ui/buttons/AddButton.vue'
import AddActivityForm from '@/components/AddActivityForm.vue'

// ============================================================================
// STORE INITIALIZATION
// ============================================================================
const authStore = useAuthStore()
const postsStore = usePostsStore()

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
const myPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

const sortedActivities = computed(() => {
  return [...myPosts.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

// ============================================================================
// PAGINATION
// ============================================================================
const PAGE_SIZE = 20
const visibleCount = ref(PAGE_SIZE)

// Only the slice currently shown
const visibleActivities = computed(() => sortedActivities.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < sortedActivities.value.length)

function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, sortedActivities.value.length)
}

// Reset pagination when the list changes (e.g. after add/delete)
// so we don't accidentally hide newly added posts at the top
function resetPagination() {
  visibleCount.value = PAGE_SIZE
}

// ============================================================================
// INFINITE SCROLL — sentinel element at the bottom
// ============================================================================
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value) {
        loadMore()
      }
    },
    { threshold: 0.1 },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

// ============================================================================
// MODAL STATE
// ============================================================================
const isModalOpen = ref(false)
const editingActivity = ref<Post | null>(null)

function openModal() {
  editingActivity.value = null
  isModalOpen.value = true
}

function editActivity(activity: Post) {
  editingActivity.value = activity
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingActivity.value = null
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================
function handleFormSubmit(formData: {
  title: string
  type: string
  date: string
  duration: string
  intensity: string
  picture: string
  notes: string
}) {
  if (!authStore.currentUser) return

  if (editingActivity.value) {
    postsStore.updatePost(editingActivity.value.id, formData)
  } else {
    postsStore.addPost({
      userId: authStore.currentUser.id,
      ...formData,
    })
    // Reset so the new post at the top is always visible
    resetPagination()
  }
  closeModal()
}

function deleteActivity(id: number) {
  postsStore.deletePost(id)
}
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Page Header -->
      <h1 class="title is-2 has-text-centered">
        <span class="icon-text is-justify-content-center">
          <span class="icon has-text-info mr-4">
            <i class="fas fa-heartbeat"></i>
          </span>
          <span>My Activities</span>
        </span>
      </h1>
      <p class="subtitle has-text-centered">Track and manage your fitness journey</p>

      <!-- Add Activity Button -->
      <div class="has-text-centered mb-5">
        <AddButton label="Add Activity" icon="fas fa-plus" @click="openModal" />
      </div>

      <!-- Activity Feed -->
      <div class="columns is-centered">
        <div class="column is-three-quarters">
          <!-- Empty state -->
          <div v-if="sortedActivities.length === 0" class="notification is-light">
            <p class="has-text-centered">
              <span class="icon is-large">
                <i class="fas fa-running fa-2x"></i>
              </span>
            </p>
            <p class="has-text-centered">No activities yet. Start tracking your fitness journey!</p>
          </div>

          <!-- Activity Cards -->
          <PostCard
            v-for="activity in visibleActivities"
            :key="activity.id"
            :post="activity"
            :show-actions="true"
            @edit="editActivity"
            @delete="deleteActivity"
          />

          <!-- Sentinel: IntersectionObserver watches this to trigger load more -->
          <div ref="sentinel" class="sentinel" />

          <!-- Load more indicator -->
          <div v-if="hasMore" class="has-text-centered py-4">
            <span class="icon has-text-grey">
              <i class="fas fa-spinner fa-pulse"></i>
            </span>
            <p class="has-text-grey is-size-7 mt-1">Loading more activities…</p>
          </div>

          <!-- All loaded message -->
          <div v-else-if="sortedActivities.length > PAGE_SIZE" class="has-text-centered py-4">
            <p class="has-text-grey is-size-7">
              <span class="icon is-small"><i class="fas fa-check-circle"></i></span>
              All {{ sortedActivities.length }} activities loaded
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Activity Modal -->
    <div class="modal" :class="{ 'is-active': isModalOpen }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-content">
        <AddActivityForm
          :activity="editingActivity"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeModal"></button>
    </div>
  </main>
</template>

<style scoped>
.sentinel {
  height: 1px;
}
</style>
