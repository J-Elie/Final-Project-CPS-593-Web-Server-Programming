<script setup lang="ts">
// ============================================================================
// IMPORTS
// ============================================================================
import type { Post } from '@/types/posts'
import type { User } from '@/types/users'

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
defineProps<{
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
 * getIntensityClass - Get Bulma color class based on intensity level
 */
function getIntensityClass(intensity: string): string {
  switch (intensity) {
    case 'Easy':
      return 'is-success'
    case 'Moderate':
      return 'is-warning'
    case 'Hard':
      return 'is-danger'
    case 'Extreme':
      return 'is-danger'
    default:
      return 'is-info'
  }
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
</script>

<template>
  <div class="card mb-4">
    <!-- Card Image (if picture provided) -->
    <div class="card-image" v-if="post.picture">
      <figure class="image is-3by1">
        <img :src="post.picture" :alt="post.title" />
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
            <span class="tag is-info is-light">{{ post.type }}</span>
            <span class="tag ml-2" :class="getIntensityClass(post.intensity)" v-if="post.intensity">
              {{ post.intensity }}
            </span>
          </p>
        </div>

        <div class="media-right" v-if="showActions">
          <!-- Edit and Delete buttons -->
          <div class="buttons">
            <button class="button is-small is-warning" @click="emit('edit', post)" title="Edit">
              <span class="icon">
                <i class="fas fa-edit"></i>
              </span>
            </button>
            <button
              class="button is-small is-danger"
              @click="emit('delete', post.id)"
              title="Delete"
            >
              <span class="icon">
                <i class="fas fa-trash"></i>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="content">
        <!-- Activity details -->
        <div class="mb-3">
          <span class="icon-text" v-if="post.duration">
            <span class="icon"><i class="fas fa-clock"></i></span>
            <span>{{ post.duration }} minutes</span>
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
            <a class="level-item">
              <span class="icon is-small has-text-danger">
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

<style scoped></style>
