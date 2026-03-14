<script setup lang="ts">
/**
 * PostDetailModal.vue
 * ===================
 * Full post detail. Click heart to like, hover heart to see who liked.
 * Add comment form at the bottom. Owner can delete comments.
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { Post } from '@/types/posts'

const props = defineProps<{
  post: Post | null
  isOpen: boolean
  isOwner?: boolean
  openCommentBox?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()

// ============================================================================
// HELPERS
// ============================================================================
const activityIcons: Record<string, string> = {
  Running: 'fa-running',
  Walking: 'fa-walking',
  Cycling: 'fa-biking',
  Swimming: 'fa-swimmer',
  Weightlifting: 'fa-dumbbell',
  Yoga: 'fa-spa',
  HIIT: 'fa-fire',
  Sports: 'fa-futbol',
}

function typeIcon(type: string) {
  return activityIcons[type] ?? 'fa-heartbeat'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDuration(dur: string) {
  const m = parseInt(dur) || 0
  const h = Math.floor(m / 60)
  const mins = m % 60
  if (h > 0 && mins > 0) return `${h}h ${mins}min`
  if (h > 0) return `${h}h`
  return `${mins}min`
}

function formatCommentDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getUser(userId: number) {
  return usersStore.users.find((u) => u.id === userId) ?? null
}

// ============================================================================
// LIKES — click to toggle, hover to see list
// ============================================================================
const hasLiked = computed(() =>
  authStore.currentUser ? (props.post?.likes ?? []).includes(authStore.currentUser.id) : false,
)

const hasCommented = computed(() =>
  authStore.currentUser
    ? (props.post?.comments ?? []).some((c) => c.userId === authStore.currentUser!.id)
    : false,
)

const likedByUsers = computed(() =>
  (props.post?.likes ?? []).map((id) => getUser(id)).filter(Boolean),
)

function toggleLike() {
  if (!authStore.currentUser || !props.post) return
  postsStore.toggleLike(props.post.id, authStore.currentUser.id)
}

// ============================================================================
// ADD COMMENT
// ============================================================================
const newComment = ref('')

function submitComment() {
  const text = newComment.value.trim()
  if (!text || !props.post || !authStore.currentUser) return
  postsStore.addComment(props.post.id, authStore.currentUser.id, text)
  newComment.value = ''
  showCommentBox.value = false
}

// ============================================================================
// DELETE COMMENT
// ============================================================================
function deleteComment(commentId: number) {
  if (!props.post) return
  postsStore.deleteComment(props.post.id, commentId)
}

// ============================================================================
// COMMENT BOX TOGGLE
// ============================================================================
const showCommentBox = ref(false)

watch(
  () => props.post?.id,
  () => {
    newComment.value = ''
    showCommentBox.value = props.openCommentBox ?? false
    editingCommentId.value = null
    editingCommentText.value = ''
    commentMenuId.value = null
  },
)

// Also react if openCommentBox prop changes while same post is open
watch(
  () => props.openCommentBox,
  (val) => {
    if (val) showCommentBox.value = true
  },
)

// Close comment box when clicking outside it
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.comment-footer-area')) {
    showCommentBox.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

// ============================================================================
// EDIT COMMENT
// ============================================================================
const editingCommentId = ref<number | null>(null)
const editingCommentText = ref('')
const commentMenuId = ref<number | null>(null)

function isMyComment(userId: number): boolean {
  return authStore.currentUser?.id === userId
}

function openCommentMenu(commentId: number) {
  commentMenuId.value = commentMenuId.value === commentId ? null : commentId
}

function startEditComment(commentId: number, currentContent: string) {
  editingCommentId.value = commentId
  editingCommentText.value = currentContent
  commentMenuId.value = null
}

function cancelEdit() {
  editingCommentId.value = null
  editingCommentText.value = ''
}

function deleteAndCloseMenu(commentId: number) {
  deleteComment(commentId)
  commentMenuId.value = null
}

function saveEdit(commentId: number) {
  const text = editingCommentText.value.trim()
  if (!text || !props.post) return
  // Update the comment content directly in the store
  const post = props.post
  const comment = post.comments?.find((c) => c.id === commentId)
  if (comment) comment.content = text
  cancelEdit()
}
</script>

<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="emit('close')" />
    <div class="modal-card post-detail-card" v-if="post">
      <!-- ── HEADER ──────────────────────────────────────────────────────── -->
      <header class="modal-card-head">
        <div class="is-flex is-align-items-center" style="gap: 0.75rem; flex: 1; min-width: 0">
          <span class="icon has-text-info is-medium">
            <i :class="`fas ${typeIcon(post.type)} fa-lg`"></i>
          </span>
          <div style="min-width: 0">
            <p
              class="modal-card-title mb-0"
              style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
            >
              {{ post.title }}
            </p>
            <p class="is-size-7 has-text-grey">{{ formatDate(post.date) }}</p>
          </div>
        </div>
        <button class="delete is-medium ml-4" aria-label="close" @click="emit('close')" />
      </header>

      <!-- ── BODY ───────────────────────────────────────────────────────── -->
      <section class="modal-card-body" style="padding-right: 1.75rem">
        <!-- Image -->
        <figure
          v-if="post.picture"
          class="image mb-4"
          style="border-radius: 6px; overflow: hidden; max-height: 280px"
        >
          <img
            :src="post.picture"
            :alt="post.title"
            style="width: 100%; height: 280px; object-fit: cover"
          />
        </figure>

        <!-- Tags & duration -->
        <div class="is-flex is-flex-wrap-wrap mb-4" style="gap: 0.5rem; align-items: center">
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
          <span
            class="tag is-light is-rounded is-small"
            style="gap: 0.25rem; padding-left: 0.5rem; padding-right: 0.6rem"
          >
            <span class="icon is-small" style="margin-right: 0.15rem"
              ><i class="fas fa-clock"></i
            ></span>
            {{ formatDuration(post.duration) }}
          </span>
        </div>

        <!-- Notes -->
        <p v-if="post.notes" class="mb-5 has-text-grey">{{ post.notes }}</p>

        <!-- ── LIKES ROW ──────────────────────────────────────────────────── -->
        <nav class="level is-mobile mb-4">
          <div class="level-left">
            <!-- Heart: click = like/unlike, hover = see who liked -->
            <div class="level-item">
              <div class="likes-hover-wrap">
                <!-- Clickable like button -->
                <button class="like-btn" @click="toggleLike">
                  <span
                    class="icon is-small"
                    :class="hasLiked ? 'has-text-success' : 'has-text-info'"
                  >
                    <i class="fas fa-heart"></i>
                  </span>
                  <span
                    class="ml-1 is-size-7"
                    :class="hasLiked ? 'has-text-success' : 'has-text-info'"
                  >
                    {{ post.likes?.length ?? 0 }}
                  </span>
                </button>

                <!-- Hover dropdown showing who liked -->
                <div class="likes-dropdown">
                  <div class="dropdown-content likes-menu">
                    <p class="dropdown-item has-text-grey heading mb-0">Liked by</p>
                    <hr class="dropdown-divider mt-1 mb-1" />
                    <div
                      v-if="likedByUsers.length === 0"
                      class="dropdown-item has-text-grey-light is-size-7"
                    >
                      No likes yet.
                    </div>
                    <div
                      v-for="user in likedByUsers"
                      :key="user!.id"
                      class="dropdown-item is-flex is-align-items-center"
                      style="gap: 0.5rem; padding-top: 0.4rem; padding-bottom: 0.4rem"
                    >
                      <figure class="image is-24x24" style="flex-shrink: 0">
                        <img
                          v-if="user!.image"
                          class="is-rounded"
                          :src="user!.image"
                          :alt="user!.firstName"
                          style="width: 24px; height: 24px; object-fit: cover"
                        />
                        <span v-else class="icon has-text-grey-light" style="font-size: 1.5rem">
                          <i class="fas fa-user-circle"></i>
                        </span>
                      </figure>
                      <div>
                        <p class="is-size-7 has-text-weight-semibold" style="line-height: 1.2">
                          {{ user!.firstName }}
                        </p>
                        <p class="is-size-7 has-text-grey" style="line-height: 1.2">
                          @{{ user!.username }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comment count — click to toggle comment box -->
            <div class="level-item">
              <button class="like-btn" @click.stop="showCommentBox = !showCommentBox">
                <span
                  class="icon is-small"
                  :class="
                    hasCommented
                      ? 'has-text-success'
                      : showCommentBox
                        ? 'has-text-info'
                        : 'has-text-grey-light'
                  "
                >
                  <i class="fas fa-comment"></i>
                </span>
                <span
                  class="ml-1 is-size-7"
                  :class="
                    hasCommented
                      ? 'has-text-success'
                      : showCommentBox
                        ? 'has-text-info'
                        : 'has-text-grey'
                  "
                >
                  {{ post.comments?.length ?? 0 }}
                </span>
              </button>
            </div>
          </div>
        </nav>

        <hr class="my-4" />

        <!-- ── COMMENTS ──────────────────────────────────────────────────── -->
        <p class="heading has-text-grey mb-3">
          <span class="icon"><i class="fas fa-comment has-text-info"></i></span>
          {{ post.comments?.length ?? 0 }}
          {{ post.comments?.length === 1 ? 'Comment' : 'Comments' }}
        </p>

        <div v-if="!post.comments?.length" class="has-text-grey-light is-size-7 mb-4">
          No comments yet. Be the first!
        </div>

        <div v-for="comment in post.comments" :key="comment.id" class="media comment-row">
          <div class="media-left">
            <figure class="image is-40x40">
              <img
                v-if="getUser(comment.userId)?.image"
                class="is-rounded"
                :src="getUser(comment.userId)!.image"
                :alt="getUser(comment.userId)!.firstName"
                style="width: 40px; height: 40px; object-fit: cover"
              />
              <span v-else class="icon has-text-grey-light" style="font-size: 2.5rem">
                <i class="fas fa-user-circle"></i>
              </span>
            </figure>
          </div>
          <div class="media-content">
            <span class="has-text-weight-semibold is-size-7">{{
              getUser(comment.userId)?.firstName
            }}</span>
            <span class="has-text-grey-light is-size-7 ml-2"
              >@{{ getUser(comment.userId)?.username }}</span
            >
            <span class="has-text-grey-light is-size-7 ml-2"
              >· {{ formatCommentDate(comment.createdAt) }}</span
            >
            <!-- Inline edit textarea -->
            <div v-if="editingCommentId === comment.id" class="mt-1">
              <textarea
                class="textarea is-small comment-input mb-1"
                rows="2"
                v-model="editingCommentText"
                @keydown.enter.exact.prevent="saveEdit(comment.id)"
                @keydown.escape="cancelEdit"
              ></textarea>
              <div class="is-flex" style="gap: 0.5rem">
                <button class="button is-info is-small" @click="saveEdit(comment.id)">Save</button>
                <button class="button is-light is-small" @click="cancelEdit">Cancel</button>
              </div>
            </div>
            <p v-else class="is-size-7 mt-1">{{ comment.content }}</p>
          </div>

          <!-- ⋮ menu — shown if you own the comment OR the post -->
          <div v-if="isMyComment(comment.userId) || isOwner" class="media-right">
            <div
              class="dropdown comment-menu-dropdown"
              :class="{ 'is-active': commentMenuId === comment.id }"
            >
              <div class="dropdown-trigger">
                <button
                  class="button is-white is-small comment-menu-btn"
                  @click.stop="openCommentMenu(comment.id)"
                >
                  <span class="icon is-small has-text-grey-light">
                    <i class="fas fa-ellipsis-v"></i>
                  </span>
                </button>
              </div>
              <div class="dropdown-menu comment-menu-panel">
                <div class="dropdown-content">
                  <a
                    v-if="isMyComment(comment.userId)"
                    class="dropdown-item"
                    @click="startEditComment(comment.id, comment.content)"
                  >
                    <span class="icon is-small has-text-info"><i class="fas fa-edit"></i></span>
                    Edit
                  </a>
                  <hr v-if="isMyComment(comment.userId)" class="dropdown-divider" />
                  <a class="dropdown-item has-text-danger" @click="deleteAndCloseMenu(comment.id)">
                    <span class="icon is-small has-text-danger"
                      ><i class="fas fa-trash-alt"></i
                    ></span>
                    Delete
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── FOOTER: Add Comment + Close ──────────────────────────────────── -->
      <footer
        class="modal-card-foot"
        style="flex-direction: column; gap: 0.75rem; align-items: stretch"
      >
        <!-- Add comment row — shown when comment icon is clicked -->
        <div
          v-if="authStore.isLoggedIn && showCommentBox"
          class="media comment-footer-area"
          style="margin-bottom: 0"
        >
          <div class="media-left">
            <figure class="image is-40x40">
              <img
                v-if="authStore.currentUser?.image"
                class="is-rounded"
                :src="authStore.currentUser.image"
                :alt="authStore.currentUser.firstName"
                style="width: 40px; height: 40px; object-fit: cover"
              />
              <span v-else class="icon has-text-grey-light" style="font-size: 2.5rem">
                <i class="fas fa-user-circle"></i>
              </span>
            </figure>
          </div>
          <div class="media-content">
            <div class="field mb-1">
              <div class="control">
                <textarea
                  class="textarea is-small comment-input"
                  placeholder="Write a comment…"
                  rows="2"
                  v-model="newComment"
                  @keydown.enter.exact.prevent="submitComment"
                ></textarea>
              </div>
            </div>
            <div class="is-flex is-justify-content-space-between is-align-items-center">
              <p class="is-size-7 has-text-grey-light">Press Enter to post</p>
              <button
                class="button is-info is-small"
                :disabled="!newComment.trim()"
                @click="submitComment"
              >
                <span class="icon is-small"><i class="fas fa-paper-plane"></i></span>
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Close button -->
        <button class="button is-info is-outlined is-fullwidth" @click="emit('close')">
          <span class="icon"><i class="fas fa-times"></i></span>
          <span>Close</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.post-detail-card {
  width: min(640px, 96vw);
  max-height: 88vh;
}

/* ── Like button ─────────────────────────────────────────────────────────── */
.like-btn {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  transition: background 0.15s;
}
.like-btn:hover {
  background: hsl(0, 0%, 96%);
}

/* ── Hover dropdown for likes ────────────────────────────────────────────── */
.likes-hover-wrap {
  position: relative;
  display: inline-block;
}

.likes-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  z-index: 40;
  min-width: 200px;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background-color: var(--bulma-scheme-main, #fff);
  border: 1px solid hsl(0, 0%, 90%);
}

.likes-hover-wrap:hover .likes-dropdown {
  display: block;
}

.likes-menu {
  max-height: 260px;
  overflow-y: auto;
  border-radius: 6px;
  background-color: var(--bulma-scheme-main, #fff);
}

/* ── Comment rows ────────────────────────────────────────────────────────── */
.comment-row {
  padding: 0.65rem 0;
  border-bottom: 1px solid hsl(0, 0%, 93%);
  margin-bottom: 0;
  align-items: center;
}
.comment-row:last-child {
  border-bottom: none;
}

/* ── Add comment ─────────────────────────────────────────────────────────── */
.comment-input {
  resize: none;
  border-radius: 8px;
}

/* ── Comment menu button ─────────────────────────────────────────────────── */
.comment-menu-btn {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0.2rem 0.3rem !important;
  height: auto !important;
  opacity: 0;
  transition: opacity 0.15s;
}

.comment-row:hover .comment-menu-btn {
  opacity: 1;
}

.comment-menu-dropdown.is-active .comment-menu-btn {
  opacity: 1;
}

/* Pop out to the LEFT of the button */
.comment-menu-panel {
  right: 0;
  left: auto;
  min-width: 130px;
  top: 0;
}
</style>
