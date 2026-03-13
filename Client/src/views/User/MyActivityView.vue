<script setup lang="ts">
import { ref, computed } from 'vue'
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
// Get only the current user's posts
const myPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

// Sort posts by date (newest first)
const sortedActivities = computed(() => {
  return [...myPosts.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

// ============================================================================
// MODAL STATE
// ============================================================================
// Track modal open/closed state
const isModalOpen = ref(false)

// Track the activity being edited (null = adding new)
const editingActivity = ref<Post | null>(null)

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================
// Open the modal for adding new activity
function openModal() {
  editingActivity.value = null
  isModalOpen.value = true
}

// Open the modal for editing an existing activity
function editActivity(activity: Post) {
  editingActivity.value = activity
  isModalOpen.value = true
}

// Close the modal
function closeModal() {
  isModalOpen.value = false
  editingActivity.value = null
}

// ============================================================================
// CRUD OPERATIONS (using store)
// ============================================================================
// Handle form submission (add or edit)
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
    // Editing existing activity - use store
    postsStore.updatePost(editingActivity.value.id, formData)
  } else {
    // Adding new activity - use store
    postsStore.addPost({
      userId: authStore.currentUser.id,
      ...formData,
    })
  }
  closeModal()
}

// Delete an activity - use store
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
            v-for="activity in sortedActivities"
            :key="activity.id"
            :post="activity"
            :show-actions="true"
            @edit="editActivity"
            @delete="deleteActivity"
          />
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

<style scoped></style>
