<script setup lang="ts">
// ============================================================================
// IMPORTS
// ============================================================================
import { computed } from 'vue'
import type { Post } from '@/types/posts'
import type { User } from '@/types/users'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import EditButton from '@/components/ui/buttons/EditButton.vue'
import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
import StatusTag from '@/components/ui/StatusTag.vue'

// ============================================================================
// STORES
// ============================================================================
const authStore = useAuthStore()
const postsStore = usePostsStore()

// ============================================================================
// PROPS
// ============================================================================
/**
 * Props interface for PostCard component
 * - post: The post data to display
 * - author: Optional user info for the post author (shown in feeds)
 * - showAuthor: Whether to display author info (default: false)
 * - showActions: Whether to show edit/delete buttons (default: false)
 */
const props = defineProps<{
  post: Post
  author?: User | null
  showAuthor?: boolean
  showActions?: boolean
}>()

// ============================================================================
// EMITS
// ============================================================================
/**
 * Events emitted by the component
 * - edit: Emitted when edit button is clicked, passes the post
 * - delete: Emitted when delete button is clicked, passes the post id
 */
const emit = defineEmits<{
  edit: [post: Post]
  delete: [postId: number]
}>()

// ============================================================================
// COMPUTED
// ============================================================================
/**
 * hasLiked - Check if the current logged-in user has liked this post
 */
const hasLiked = computed(() => {
  if (!authStore.currentUser) return false
  return props.post.likes?.includes(authStore.currentUser.id) ?? false
})

// ============================================================================
// ACTIONS
// ============================================================================
/**
 * handleLike - Toggle like on this post for the current user
 */
function handleLike() {
  if (!authStore.currentUser) return
  postsStore.toggleLike(props.post.id, authStore.currentUser.id)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * formatDate - Format ISO date string for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * getActivityIcon - Get Font Awesome icon class based on activity type
 */
function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    Running: 'fa-running',
    Walking: 'fa-walking',
    Cycling: 'fa-biking',
    Swimming: 'fa-swimmer',
    Weightlifting: 'fa-dumbbell',
    Yoga: 'fa-spa',
    HIIT: 'fa-fire',
    Sports: 'fa-futbol',
  }
  return icons[type] || 'fa-heartbeat'
}

/**
 * formatDuration - Format total minutes into a readable hh:mm string
 */
function formatDuration(duration: string): string {
  const totalMins = parseInt(duration) || 0
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}min`
  if (hours > 0) return `${hours}h`
  return `${mins}min`
}
</script>

<template>
  <div class="card mb-4">
    <!-- Card Image (if picture provided) -->
    <div class="card-image" v-if="post.picture">
      <figure class="image is-3by1">
        <img :src="post.picture" :alt="post.title" class="post-card-img" />
      </figure>
    </div>

    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <!-- Author avatar (if showAuthor) or activity type icon -->
          <figure class="image is-48x48" v-if="showAuthor && author">
            <img
              class="is-rounded"
              :src="author.image || 'https://via.placeholder.com/48'"
              :alt="author.firstName"
            />
          </figure>
          <figure class="image is-48x48" v-else>
            <span class="icon is-large has-text-info">
              <i class="fas fa-2x" :class="getActivityIcon(post.type)"></i>
            </span>
          </figure>
        </div>

        <div class="media-content">
          <!-- Author info (if showAuthor) -->
          <div v-if="showAuthor && author" class="mb-2">
            <strong>{{ author.firstName }}</strong>
            <small class="has-text-grey ml-2">@{{ author.username }}</small>
          </div>

          <p class="title is-4 mb-2">{{ post.title }}</p>
          <p class="subtitle is-6">
            <StatusTag :label="post.type" variant="info" size="small" />
            <StatusTag
              v-if="post.intensity"
              :label="post.intensity"
              :variant="
                post.intensity === 'Easy'
                  ? 'success'
                  : post.intensity === 'Moderate'
                    ? 'warning'
                    : 'danger'
              "
              size="small"
              class="ml-2"
            />
          </p>
        </div>

        <div class="media-right" v-if="showActions">
          <!-- Edit and Delete buttons -->
          <div class="buttons">
            <EditButton small @click="emit('edit', post)" />
            <DeleteButton small @click="emit('delete', post.id)" />
          </div>
        </div>
      </div>

      <div class="content">
        <!-- Activity details -->
        <div class="mb-3">
          <span class="icon-text" v-if="post.duration">
            <span class="icon"><i class="fas fa-clock"></i></span>
            <span>{{ formatDuration(post.duration) }}</span>
          </span>
        </div>

        <!-- Notes -->
        <p v-if="post.notes">{{ post.notes }}</p>

        <!-- Date -->
        <br />
        <time :datetime="post.date">
          <span class="icon"><i class="fas fa-calendar"></i></span>
          {{ formatDate(post.date) }}
        </time>

        <!-- Likes and Comments (for feed view) -->
        <nav class="level is-mobile mt-3" v-if="showAuthor">
          <div class="level-left">
            <a class="level-item like-button" @click="handleLike">
              <span class="icon is-small" :class="hasLiked ? 'has-text-danger' : 'has-text-info'">
                <i class="fas fa-heart"></i>
              </span>
              <span class="ml-1">{{ post.likes?.length || 0 }}</span>
            </a>
            <a class="level-item">
              <span class="icon is-small has-text-info">
                <i class="fas fa-comment"></i>
              </span>
              <span class="ml-1">{{ post.comments?.length || 0 }}</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-card-img {
  height: 300px;
  width: auto;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.like-button {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.like-button:hover {
  transform: scale(1.2);
}
</style>
