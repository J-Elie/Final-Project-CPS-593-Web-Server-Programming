<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import StatusTag from '@/components/ui/StatusTag.vue'
import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
import type { Post } from '@/types/posts'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()

// ============================================================================
// FLAGGED WORDS
// ============================================================================
const flaggedWords = [
  'inappropriate',
  'offensive',
  'spam',
  'abuse',
  'scam',
  'fraud',
  'cheat',
  'illegal',
  'drugs',
  'violence',
  'harassment',
  'bully',
  'threat',
  'hate',
  'explicit',
  'nsfw',
]

function matchedWords(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase()
  return flaggedWords.filter((w) => {
    const regex = new RegExp(`\\b${w}\\b`)
    return regex.test(lower)
  })
}

function highlightFlagged(text: string): boolean {
  return matchedWords(text).length > 0
}

// ============================================================================
// DISMISSED — admin manually reviewed and cleared
// ============================================================================
const dismissedIds = ref<Set<number>>(new Set())

function dismissPost(postId: number) {
  dismissedIds.value = new Set([...dismissedIds.value, postId])
  if (expandedPostId.value === postId) expandedPostId.value = null
}

// ============================================================================
// FLAGGED POSTS
// ============================================================================
const flaggedPosts = computed(() => {
  return postsStore.posts
    .filter((post) => !dismissedIds.value.has(post.id))
    .map((post) => {
      const allText = [post.title, post.notes, ...(post.comments ?? []).map((c) => c.content)]
        .filter(Boolean)
        .join(' ')

      const words = matchedWords(allText)
      if (words.length === 0) return null

      return { post, words }
    })
    .filter(Boolean) as { post: Post; words: string[] }[]
})

// ============================================================================
// HELPERS
// ============================================================================
function getUser(userId: number) {
  return usersStore.users.find((u) => u.id === userId)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function deletePost(postId: number) {
  if (!confirm('Permanently delete this post?')) return
  postsStore.deletePost(postId)
  dismissedIds.value = new Set([...dismissedIds.value, postId])
  if (expandedPostId.value === postId) expandedPostId.value = null
}

// ============================================================================
// EXPAND / COLLAPSE
// ============================================================================
const expandedPostId = ref<number | null>(null)

function toggleExpand(postId: number) {
  expandedPostId.value = expandedPostId.value === postId ? null : postId
}
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Page Header -->
      <h1 class="title is-2 has-text-centered">
        <span class="icon-text is-justify-content-center">
          <span class="icon has-text-info mr-4">
            <i class="fas fa-flag"></i>
          </span>
          <span>Flagged Posts</span>
        </span>
      </h1>
      <p class="subtitle has-text-centered">Review posts containing flagged content</p>

      <!-- Not admin -->
      <div v-if="authStore.currentUser?.role !== 'admin'" class="columns is-centered">
        <div class="column is-half">
          <div class="notification is-danger has-text-centered">
            <p>
              <span class="icon"><i class="fas fa-lock"></i></span>
              Admin access only.
            </p>
          </div>
        </div>
      </div>

      <div v-else class="columns is-centered">
        <div class="column is-three-quarters">
          <!-- Summary -->
          <div class="box mb-5 is-flex is-align-items-center" style="gap: 1rem">
            <span class="icon is-large has-text-info">
              <i class="fas fa-flag fa-2x"></i>
            </span>
            <div>
              <p class="title is-4 mb-0 has-text-info">{{ flaggedPosts.length }}</p>
              <p class="heading has-text-grey">
                {{ flaggedPosts.length === 1 ? 'post needs review' : 'posts need review' }}
              </p>
            </div>
            <div class="ml-auto">
              <span class="tag is-info is-light is-rounded">Auto-detected by keyword filter</span>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="flaggedPosts.length === 0"
            class="notification is-success is-light has-text-centered"
          >
            <p>
              <span class="icon is-large"><i class="fas fa-check-circle fa-2x"></i></span>
            </p>
            <p class="is-size-5 mt-3">All clear — no flagged posts right now.</p>
          </div>

          <!-- Flagged post cards -->
          <div v-for="{ post, words } in flaggedPosts" :key="post.id" class="box flagged-box mb-4">
            <!-- Card header row -->
            <div class="is-flex is-align-items-flex-start" style="gap: 0.75rem">
              <!-- Avatar -->
              <figure class="image is-48x48" style="flex-shrink: 0; margin-top: 0.1rem">
                <img
                  v-if="getUser(post.userId)?.image"
                  class="is-rounded"
                  :src="getUser(post.userId)!.image"
                  :alt="getUser(post.userId)!.firstName"
                  style="width: 48px; height: 48px; object-fit: cover"
                />
                <span v-else class="icon has-text-grey-light" style="font-size: 3rem">
                  <i class="fas fa-user-circle"></i>
                </span>
              </figure>

              <!-- Title + meta -->
              <div style="flex: 1; min-width: 0">
                <p class="has-text-weight-bold">{{ post.title }}</p>
                <p class="is-size-7 has-text-grey mb-2">
                  by {{ getUser(post.userId)?.firstName ?? 'Unknown' }} · @{{
                    getUser(post.userId)?.username ?? '?'
                  }}
                  · {{ formatDate(post.date) }}
                </p>

                <!-- Flagged words as tags -->
                <div class="tags">
                  <span
                    v-for="word in words"
                    :key="word"
                    class="tag is-danger is-light is-rounded is-small"
                  >
                    {{ word }}
                  </span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="buttons" style="flex-shrink: 0; align-items: flex-start">
                <button class="button is-info is-outlined is-small" @click="toggleExpand(post.id)">
                  <span class="icon is-small">
                    <i
                      :class="
                        expandedPostId === post.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
                      "
                    ></i>
                  </span>
                  <span>{{ expandedPostId === post.id ? 'Hide' : 'Review' }}</span>
                </button>
                <button
                  class="button is-success is-outlined is-small"
                  @click="dismissPost(post.id)"
                >
                  <span class="icon is-small"><i class="fas fa-check"></i></span>
                  <span>Dismiss</span>
                </button>
                <DeleteButton :small="true" @click="deletePost(post.id)" />
              </div>
            </div>

            <!-- Expanded review section -->
            <div v-if="expandedPostId === post.id" class="expand-section mt-4">
              <!-- Image -->
              <figure
                v-if="post.picture"
                class="image mb-4"
                style="border-radius: 6px; overflow: hidden; max-height: 220px"
              >
                <img
                  :src="post.picture"
                  :alt="post.title"
                  style="width: 100%; height: 220px; object-fit: cover"
                />
              </figure>

              <!-- Post meta tags -->
              <div class="mb-3" style="display: flex; flex-wrap: wrap; gap: 0.4rem">
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
                />
                <span class="tag is-light is-rounded is-small">{{ post.duration }}min</span>
                <span class="tag is-light is-rounded is-small"
                  >{{ post.likes?.length ?? 0 }} likes</span
                >
              </div>

              <!-- Notes — highlight if flagged -->
              <div
                v-if="post.notes"
                class="mb-4 p-3 notes-box"
                :class="{ 'flagged-text': highlightFlagged(post.notes) }"
              >
                <p class="is-size-7 has-text-grey-dark">{{ post.notes }}</p>
                <p v-if="highlightFlagged(post.notes)" class="is-size-7 has-text-danger mt-1">
                  Flagged words: {{ matchedWords(post.notes).join(', ') }}
                </p>
              </div>

              <!-- Comments -->
              <div v-if="post.comments?.length">
                <p class="heading has-text-grey mb-2">Comments ({{ post.comments.length }})</p>
                <div
                  v-for="comment in post.comments"
                  :key="comment.id"
                  class="media comment-row"
                  :class="{ 'flagged-comment': highlightFlagged(comment.content) }"
                >
                  <div class="media-left">
                    <figure class="image is-32x32">
                      <img
                        v-if="getUser(comment.userId)?.image"
                        class="is-rounded"
                        :src="getUser(comment.userId)!.image"
                        style="width: 32px; height: 32px; object-fit: cover"
                      />
                      <span v-else class="icon has-text-grey-light" style="font-size: 2rem">
                        <i class="fas fa-user-circle"></i>
                      </span>
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="is-size-7">
                      <strong>{{ getUser(comment.userId)?.firstName }}</strong>
                      <span class="has-text-grey-light ml-1"
                        >@{{ getUser(comment.userId)?.username }}</span
                      >
                    </p>
                    <p class="is-size-7 mt-1">{{ comment.content }}</p>
                    <p
                      v-if="highlightFlagged(comment.content)"
                      class="is-size-7 has-text-danger mt-1"
                    >
                      Flagged: {{ matchedWords(comment.content).join(', ') }}
                    </p>
                  </div>
                  <div class="media-right">
                    <button
                      class="button is-white is-small delete-btn"
                      @click="postsStore.deleteComment(post.id, comment.id)"
                      title="Delete comment"
                    >
                      <span class="icon is-small has-text-grey-light">
                        <i class="fas fa-trash-alt"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.flagged-box {
  border-left: 4px solid hsl(348, 86%, 61%);
  transition: box-shadow 0.2s;
}
.flagged-box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.expand-section {
  border-top: 1px solid hsl(0, 0%, 93%);
  padding-top: 1rem;
}

.notes-box {
  border-radius: 6px;
  background: hsl(0, 0%, 98%);
  border: 1px solid hsl(0, 0%, 93%);
}

.flagged-text {
  background: hsl(348, 86%, 97%);
  border-color: hsl(348, 86%, 80%);
}

.comment-row {
  padding: 0.6rem 0;
  border-bottom: 1px solid hsl(0, 0%, 95%);
  margin-bottom: 0;
  align-items: flex-start;
}
.comment-row:last-child {
  border-bottom: none;
}

.flagged-comment {
  background: hsl(348, 86%, 98%);
  border-radius: 4px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.delete-btn {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.delete-btn:hover .icon {
  color: hsl(348, 86%, 61%) !important;
}
</style>
