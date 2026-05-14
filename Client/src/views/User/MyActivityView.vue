<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInfiniteScroll } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useSessionStore } from '@/stores/session'
import type { Post } from '../../../../Server/Types/posts'
import type { DataListEnvelope, DataEnvelope } from '../../../../Server/Types/dataEnvelopes'
import PostCard from '@/components/PostCard.vue'
import PostDetailModal from '@/components/modal/PostDetailModal.vue'
import AddButton from '@/components/ui/buttons/AddButton.vue'
import AddActivityForm from '@/components/AddActivityForm.vue'
import FeedCounter from '@/components/ui/FeedCounter.vue'
import BackToTopButton from '@/components/ui/BackToTopButton.vue'
import PostCardSkeleton from '@/components/ui/PostCardSkeleton.vue'
import { getActivityIcon, formatDuration } from '@/Services/activityHelpers'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const sessionStore = useSessionStore()
const route = useRoute()
const router = useRouter()

// ============================================================================
// VIEW MODE
// ============================================================================
const viewMode = ref<'list' | 'grid' | 'condensed'>('list')

// ============================================================================
// INFINITE SCROLL STATE
// ============================================================================
const PAGE_SIZE = 5

// IDs in display order; actual Post objects come from the store so that
// reactive mutations (likes, comments) are reflected immediately.
const loadedPostIds = ref<number[]>([])
const loadedPosts = computed(() =>
  loadedPostIds.value
    .map((id) => postsStore.getPostById(id))
    .filter((p): p is Post => p !== undefined),
)
const totalCount = ref(0)
const currentPage = ref(1)
const isLoadingMore = ref(false)
const allLoaded = ref(false)

const isEmpty = computed(
  () => !isLoadingMore.value && loadedPosts.value.length === 0 && allLoaded.value,
)

async function loadNextPage() {
  if (isLoadingMore.value || allLoaded.value || !authStore.currentUser) return
  isLoadingMore.value = true
  try {
    const userId = authStore.currentUser.id
    const qs = `userIds=${userId}&page=${currentPage.value}&pageSize=${PAGE_SIZE}`
    const result = await sessionStore.api<DataListEnvelope<Post>>(`posts/feed?${qs}`)
    for (const p of result.data) {
      if (!postsStore.posts.find((sp) => sp.id === p.id)) postsStore.posts.push(p)
    }
    loadedPostIds.value.push(...result.data.map((p) => p.id))
    totalCount.value = result.total
    if (loadedPostIds.value.length >= result.total || result.data.length === 0) {
      allLoaded.value = true
    } else {
      currentPage.value++
    }
  } finally {
    isLoadingMore.value = false
  }
}

// Reset and reload when user changes
watch(
  () => authStore.currentUser?.id,
  async (userId) => {
    if (!userId) return
    loadedPostIds.value = []
    totalCount.value = 0
    currentPage.value = 1
    allLoaded.value = false
    await loadNextPage()
  },
  { immediate: true },
)

// Infinite scroll — VueUse targets window (where the page scroll actually happens)
useInfiniteScroll(
  window,
  async () => {
    await loadNextPage()
  },
  {
    distance: 300,
    canLoadMore: () => !allLoaded.value,
  },
)

// ============================================================================
// SCROLL TO POST & HIGHLIGHT
// ============================================================================
const highlightedPostId = ref<number | null>(null)
const postRefs = ref<Record<number, HTMLElement>>({})

function setPostRef(el: HTMLElement | null, postId: number) {
  if (el) postRefs.value[postId] = el
}

async function scrollToPost(postId: number) {
  if (loadedPostIds.value.includes(postId)) {
    await nextTick()
    const el = postRefs.value[postId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightedPostId.value = postId
      setTimeout(() => {
        highlightedPostId.value = null
        router.replace({ query: {} })
      }, 3000)
    }
    return
  }
  // Post not in current batch — fetch directly and open modal
  try {
    const result = await sessionStore.api<DataEnvelope<Post>>(`posts/${postId}`)
    openDetail(result.data)
    router.replace({ query: {} })
  } catch {
    // post not found, ignore
  }
}

onMounted(async () => {
  const targetId = Number(route.query.post)
  if (targetId) await scrollToPost(targetId)
})

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
  openCommentBox.value = false
  detailPost.value = null
}

// ============================================================================
// ADD / EDIT MODAL
// ============================================================================
const isFormModalOpen = ref(false)
const editingActivity = ref<Post | null>(null)

function openModal() {
  editingActivity.value = null
  isFormModalOpen.value = true
}

function editActivity(activity: Post) {
  editingActivity.value = activity
  isFormModalOpen.value = true
}

function closeModal() {
  isFormModalOpen.value = false
  editingActivity.value = null
}

async function handleFormSubmit(formData: {
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
    await postsStore.updatePost(editingActivity.value.id, formData)
    // store is updated; the computed loadedPosts will reflect the change automatically
  } else {
    const newPost = await postsStore.addPost({ userId: authStore.currentUser.id, ...formData })
    loadedPostIds.value.unshift(newPost.id)
    totalCount.value++
  }
  closeModal()
}

function deleteActivity(id: number) {
  postsStore.deletePost(id)
  const idx = loadedPostIds.value.indexOf(id)
  if (idx !== -1) {
    loadedPostIds.value.splice(idx, 1)
    totalCount.value = Math.max(0, totalCount.value - 1)
  }
}

// ============================================================================
// SHARE
// ============================================================================
const copiedPostId = ref<number | null>(null)

function sharePost(postId: number) {
  const url = `${window.location.origin}/User/MyActivity?post=${postId}`
  navigator.clipboard.writeText(url)
  copiedPostId.value = postId
  setTimeout(() => (copiedPostId.value = null), 2000)
}

// ============================================================================
// ACTIVITY ICON (for grid/condensed tiles)
// ============================================================================
function typeIcon(type: string) {
  return getActivityIcon(type)
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

      <!-- Toolbar: Add + View switcher -->
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
        <AddButton label="Add Activity" icon="fas fa-plus" @click="openModal" />

        <!-- View mode buttons -->
        <div class="buttons has-addons">
          <button
            class="button is-small"
            :class="viewMode === 'list' ? 'is-info' : 'is-light'"
            @click="viewMode = 'list'"
            title="List view"
          >
            <span class="icon is-small"><i class="fas fa-list"></i></span>
          </button>
          <button
            class="button is-small"
            :class="viewMode === 'grid' ? 'is-info' : 'is-light'"
            @click="viewMode = 'grid'"
            title="Grid view"
          >
            <span class="icon is-small"><i class="fas fa-th"></i></span>
          </button>
          <button
            class="button is-small"
            :class="viewMode === 'condensed' ? 'is-info' : 'is-light'"
            @click="viewMode = 'condensed'"
            title="Condensed view"
          >
            <span class="icon is-small"><i class="fas fa-th-list"></i></span>
          </button>
        </div>
      </div>

      <!-- ── LIST VIEW ─────────────────────────────────────────────────────── -->
      <template v-if="viewMode === 'list'">
        <div class="columns is-centered">
          <div class="column is-three-quarters">
            <div v-if="isEmpty" class="notification is-light">
              <p class="has-text-centered">
                <span class="icon is-large"><i class="fas fa-running fa-2x"></i></span>
              </p>
              <p class="has-text-centered">
                No activities yet. Start tracking your fitness journey!
              </p>
            </div>

            <div
              v-for="activity in loadedPosts"
              :class="{ 'is-highlighted': highlightedPostId === activity.id }"
            >
              <div class="post-click-area" @click="openDetail(activity)">
                <PostCard
                  :post="activity"
                  :show-actions="true"
                  :show-stats="true"
                  :copied="copiedPostId === activity.id"
                  @edit="editActivity(activity)"
                  @delete="deleteActivity(activity.id)"
                  @share="sharePost(activity.id)"
                  @open-comments="openDetailWithComments(activity)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── GRID VIEW (Instagram-style) ───────────────────────────────────── -->
      <template v-if="viewMode === 'grid'">
        <div v-if="isEmpty" class="notification is-light has-text-centered">No activities yet.</div>
        <div class="grid-layout">
          <div
            v-for="activity in loadedPosts"
            :key="activity.id"
            :ref="(el) => setPostRef(el as HTMLElement, activity.id)"
            class="grid-tile"
            :class="{ 'is-highlighted': highlightedPostId === activity.id }"
            @click="openDetail(activity)"
          >
            <!-- Image or icon placeholder -->
            <div class="grid-tile-img">
              <img v-if="activity.picture" :src="activity.picture" :alt="activity.title" />
              <div v-else class="grid-tile-placeholder">
                <span class="icon has-text-info" style="font-size: 2.5rem">
                  <i :class="`fas ${typeIcon(activity.type)}`"></i>
                </span>
              </div>
            </div>

            <!-- Hover overlay -->
            <div class="grid-tile-overlay">
              <p
                class="has-text-white has-text-weight-bold is-size-7 mb-1"
                style="line-height: 1.2"
              >
                {{ activity.title }}
              </p>
              <div class="is-flex" style="gap: 0.75rem">
                <span class="has-text-white is-size-7">
                  <i class="fas fa-heart"></i> {{ activity.likes?.length ?? 0 }}
                </span>
                <span class="has-text-white is-size-7">
                  <i class="fas fa-comment"></i> {{ activity.comments?.length ?? 0 }}
                </span>
              </div>
            </div>

            <!-- Edit/Delete actions -->
            <div class="grid-tile-actions" @click.stop>
              <button
                class="button is-white is-small grid-action-btn"
                @click.stop="editActivity(activity)"
                title="Edit"
              >
                <span class="icon is-small has-text-info"><i class="fas fa-edit"></i></span>
              </button>
              <button
                class="button is-white is-small grid-action-btn"
                @click.stop="deleteActivity(activity.id)"
                title="Delete"
              >
                <span class="icon is-small has-text-grey"><i class="fas fa-trash-alt"></i></span>
              </button>
              <button
                class="button is-white is-small grid-action-btn"
                @click.stop="sharePost(activity.id)"
                title="Share"
              >
                <span
                  class="icon is-small"
                  :class="copiedPostId === activity.id ? 'has-text-success' : 'has-text-grey'"
                >
                  <i
                    :class="copiedPostId === activity.id ? 'fas fa-check' : 'fas fa-share-alt'"
                  ></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ── CONDENSED VIEW ────────────────────────────────────────────────── -->
      <template v-if="viewMode === 'condensed'">
        <div class="columns is-centered">
          <div class="column is-three-quarters">
            <div v-if="isEmpty" class="notification is-light has-text-centered">
              No activities yet.
            </div>
            <div
              v-for="activity in loadedPosts"
              :key="activity.id"
              :ref="(el) => setPostRef(el as HTMLElement, activity.id)"
              class="condensed-row"
              :class="{ 'is-highlighted': highlightedPostId === activity.id }"
              @click="openDetail(activity)"
            >
              <!-- Icon -->
              <span class="icon has-text-info condensed-icon">
                <i :class="`fas ${typeIcon(activity.type)}`"></i>
              </span>

              <!-- Title + meta -->
              <div class="condensed-content">
                <p class="has-text-weight-semibold is-size-7">{{ activity.title }}</p>
                <p class="has-text-grey is-size-7">
                  {{ activity.type }} · {{ formatDuration(activity.duration) }} ·
                  {{ activity.date }}
                </p>
              </div>

              <!-- Stats -->
              <div class="condensed-stats">
                <span class="is-size-7 has-text-grey mr-3">
                  <i class="fas fa-heart has-text-info"></i> {{ activity.likes?.length ?? 0 }}
                </span>
                <span class="is-size-7 has-text-grey">
                  <i class="fas fa-comment has-text-info"></i> {{ activity.comments?.length ?? 0 }}
                </span>
              </div>

              <!-- Actions -->
              <div class="condensed-actions" @click.stop>
                <button
                  class="button is-white is-small condensed-btn"
                  @click.stop="editActivity(activity)"
                >
                  <span class="icon is-small has-text-info"><i class="fas fa-edit"></i></span>
                </button>
                <button
                  class="button is-white is-small condensed-btn"
                  @click.stop="deleteActivity(activity.id)"
                >
                  <span class="icon is-small has-text-grey"><i class="fas fa-trash-alt"></i></span>
                </button>
                <button
                  class="button is-white is-small condensed-btn"
                  @click.stop="sharePost(activity.id)"
                >
                  <span
                    class="icon is-small"
                    :class="copiedPostId === activity.id ? 'has-text-success' : 'has-text-grey'"
                  >
                    <i
                      :class="copiedPostId === activity.id ? 'fas fa-check' : 'fas fa-share-alt'"
                    ></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Skeleton loading (list view) -->
      <div v-if="isLoadingMore && viewMode === 'list'" class="columns is-centered">
        <div class="column is-three-quarters">
          <PostCardSkeleton :count="PAGE_SIZE" :actions="3" />
        </div>
      </div>

      <!-- Spinner for grid/condensed while loading -->
      <div v-if="isLoadingMore && viewMode !== 'list'" class="has-text-centered py-4">
        <span class="icon has-text-grey"><i class="fas fa-spinner fa-pulse"></i></span>
      </div>

      <!-- All loaded indicator -->
      <div v-if="allLoaded && loadedPosts.length > 0" class="has-text-centered py-4">
        <span class="tag is-success is-light">
          <span class="icon is-small"><i class="fas fa-check-circle"></i></span>
          <span>All {{ loadedPosts.length }} activities loaded</span>
        </span>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <PostDetailModal
      :post="detailPost"
      :is-open="detailPost !== null"
      :is-owner="true"
      :open-comment-box="openCommentBox"
      @close="closeDetail"
    />

    <FeedCounter :shown="loadedPosts.length" :total="totalCount" label="activities" />
    <BackToTopButton />

    <!-- Add/Edit Modal -->
    <div class="modal" :class="{ 'is-active': isFormModalOpen }">
      <div class="modal-background" @click="closeModal" />
      <div class="modal-content">
        <AddActivityForm
          :activity="editingActivity"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeModal" />
    </div>
  </main>
</template>

<style scoped>
/* ── Shared highlight ──────────────────────────────────────────────────────── */
.is-highlighted {
  outline: 3px solid hsl(204, 86%, 53%);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px hsla(204, 86%, 53%, 0.15);
}

/* ── List view ─────────────────────────────────────────────────────────────── */
.post-wrapper {
  border-radius: 8px;
  transition:
    outline 0.3s,
    box-shadow 0.3s;
  margin-bottom: 0.5rem;
}

.post-click-area {
  cursor: pointer;
}
.post-click-area:hover .card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* ── Grid view ─────────────────────────────────────────────────────────────── */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .grid-layout {
    grid-template-columns: repeat(2, 1fr);
  }
}

.grid-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
  background: hsl(0, 0%, 95%);
  border-radius: 4px;
}

.grid-tile-img {
  width: 100%;
  height: 100%;
}

.grid-tile-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.grid-tile-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(204, 86%, 97%);
}

/* Hover overlay with likes/comments */
.grid-tile-overlay {
  position: absolute;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.grid-tile:hover .grid-tile-overlay {
  opacity: 1;
}

/* Edit/delete/share — top right corner, hidden until hover */
.grid-tile-actions {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  display: flex;
  gap: 0.2rem;
  opacity: 0;
  transition: opacity 0.2s;
}
.grid-tile:hover .grid-tile-actions {
  opacity: 1;
}

.grid-action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsla(255, 255%, 255%, 0.85) !important;
}

/* ── Condensed view ────────────────────────────────────────────────────────── */
.condensed-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid hsl(0, 0%, 93%);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s;
}
.condensed-row:last-child {
  border-bottom: none;
}
.condensed-row:hover {
  background-color: hsl(0, 0%, 98%);
}

.condensed-icon {
  flex-shrink: 0;
}

.condensed-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.condensed-content p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.condensed-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.condensed-actions {
  flex-shrink: 0;
  display: flex;
  gap: 0.1rem;
}

.condensed-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Skeleton shimmer handled by PostCardSkeleton component ─────────────── */
</style>
