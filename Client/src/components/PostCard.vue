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
const props = defineProps<{
  post: Post
  author?: User | null
  showAuthor?: boolean
  showActions?: boolean
  showStats?: boolean // show likes/comments/share row (My Activities)
  copied?: boolean // true = show "Copied!" on share button
}>()

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits<{
  edit: [post: Post]
  delete: [postId: number]
  share: []
  openComments: [post: Post]
}>()

// ============================================================================
// COMPUTED
// ============================================================================
const hasLiked = computed(() =>
  authStore.currentUser ? (props.post.likes?.includes(authStore.currentUser.id) ?? false) : false,
)

// ============================================================================
// ACTIONS
// ============================================================================
function handleLike() {
  if (!authStore.currentUser) return
  postsStore.toggleLike(props.post.id, authStore.currentUser.id)
}

// ============================================================================
// HELPERS
// ============================================================================
function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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
    <!-- Card Image -->
    <div class="card-image" v-if="post.picture">
      <figure class="image is-3by1">
        <img :src="post.picture" :alt="post.title" class="post-card-img" />
      </figure>
    </div>

    <div class="card-content">
      <div class="media">
        <div class="media-left">
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
                    ? 'info'
                    : 'info'
              "
              size="small"
              class="ml-2"
            />
          </p>
        </div>

        <div class="media-right" v-if="showActions">
          <div class="buttons" @click="(e: MouseEvent) => e.stopPropagation()">
            <EditButton small @click="emit('edit', post)" />
            <DeleteButton small @click="emit('delete', post.id)" />
          </div>
        </div>
      </div>

      <div class="content">
        <div class="mb-3">
          <span class="icon-text" v-if="post.duration">
            <span class="icon"><i class="fas fa-clock"></i></span>
            <span>{{ formatDuration(post.duration) }}</span>
          </span>
        </div>

        <p v-if="post.notes">{{ post.notes }}</p>

        <br />
        <time :datetime="post.date">
          <span class="icon"><i class="fas fa-calendar"></i></span>
          {{ formatDate(post.date) }}
        </time>

        <!-- Feed view: likes + comments with like button -->
        <nav
          class="level is-mobile mt-3"
          v-if="showAuthor"
          @click="(e: MouseEvent) => e.stopPropagation()"
        >
          <div class="level-left">
            <a class="level-item like-button" @click="handleLike">
              <span class="icon is-small" :class="hasLiked ? 'has-text-success' : 'has-text-info'">
                <i class="fas fa-heart"></i>
              </span>
              <span class="ml-1" :class="hasLiked ? 'has-text-success' : 'has-text-info'">{{
                post.likes?.length || 0
              }}</span>
            </a>
            <a class="level-item like-button" @click="emit('openComments', post)">
              <span class="icon is-small has-text-info">
                <i class="fas fa-comment"></i>
              </span>
              <span class="ml-1">{{ post.comments?.length || 0 }}</span>
            </a>
          </div>
        </nav>

        <!-- My Activities view: likes + comments + share inside the card -->
        <div v-if="showStats" @click="(e: MouseEvent) => e.stopPropagation()">
          <nav class="level is-mobile mt-3 stats-row">
            <div class="level-left">
              <span class="level-item has-text-grey">
                <span class="icon is-small has-text-info"><i class="fas fa-heart"></i></span>
                <span class="ml-1 is-size-7">{{ post.likes?.length || 0 }}</span>
              </span>
              <span class="level-item has-text-grey">
                <span class="icon is-small has-text-info"><i class="fas fa-comment"></i></span>
                <span class="ml-1 is-size-7">{{ post.comments?.length || 0 }}</span>
              </span>
            </div>
            <div class="level-right">
              <a class="level-item share-btn" @click="emit('share')">
                <span class="icon is-small">
                  <i
                    :class="
                      copied
                        ? 'fas fa-check has-text-success'
                        : 'fas fa-share-alt has-text-grey-light'
                    "
                  ></i>
                </span>
                <span
                  class="is-size-7 ml-1"
                  :class="copied ? 'has-text-success' : 'has-text-grey-light'"
                >
                  {{ copied ? 'Copied!' : 'Share' }}
                </span>
              </a>
            </div>
          </nav>
        </div>
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

.stats-row {
  border-top: 1px solid hsl(0, 0%, 95%);
  padding-top: 0.5rem;
}

.share-btn {
  opacity: 0.5;
  transition: opacity 0.15s;
  cursor: pointer;
}
.share-btn:hover {
  opacity: 1;
}
</style>
