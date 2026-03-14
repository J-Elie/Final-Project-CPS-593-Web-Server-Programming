<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import type { Post } from '@/types/posts'
import PostCard from '@/components/PostCard.vue'
import PostDetailModal from '@/components/modal/PostDetailModal.vue'
import AddButton from '@/components/ui/buttons/AddButton.vue'
import AddActivityForm from '@/components/AddActivityForm.vue'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const route = useRoute()
const router = useRouter()

// ============================================================================
// VIEW MODE
// ============================================================================
const viewMode = ref<'list' | 'grid' | 'condensed'>('list')

// ============================================================================
// POSTS
// ============================================================================
const myPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

const sortedActivities = computed(() =>
  [...myPosts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
)

// ============================================================================
// PAGINATION
// ============================================================================
const PAGE_SIZE = 20
const visibleCount = ref(PAGE_SIZE)

const visibleActivities = computed(() => sortedActivities.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < sortedActivities.value.length)

function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, sortedActivities.value.length)
}

function resetPagination() {
  visibleCount.value = PAGE_SIZE
}

// ============================================================================
// INFINITE SCROLL
// ============================================================================
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value) loadMore()
    },
    { threshold: 0.1 },
  )
  if (sentinel.value) observer.observe(sentinel.value)
  const targetId = Number(route.query.post)
  if (targetId) await scrollToPost(targetId)
})

onUnmounted(() => observer?.disconnect())

// ============================================================================
// SCROLL TO POST & HIGHLIGHT
// ============================================================================
const highlightedPostId = ref<number | null>(null)
const postRefs = ref<Record<number, HTMLElement>>({})

function setPostRef(el: HTMLElement | null, postId: number) {
  if (el) postRefs.value[postId] = el
}

async function scrollToPost(postId: number) {
  const idx = sortedActivities.value.findIndex((p) => p.id === postId)
  if (idx === -1) return
  while (idx >= visibleCount.value) {
    loadMore()
    await nextTick()
  }
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
}

// ============================================================================
// POST DETAIL MODAL
// ============================================================================
const detailPost = ref<Post | null>(null)

function openDetail(post: Post) {
  detailPost.value = post
}

function closeDetail() {
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
    postsStore.addPost({ userId: authStore.currentUser.id, ...formData })
    resetPagination()
  }
  closeModal()
}

function deleteActivity(id: number) {
  postsStore.deletePost(id)
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

function formatDuration(dur: string) {
  const m = parseInt(dur) || 0
  const h = Math.floor(m / 60)
  const mins = m % 60
  if (h > 0 && mins > 0) return `${h}h ${mins}m`
  if (h > 0) return `${h}h`
  return `${mins}m`
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
            <div v-if="sortedActivities.length === 0" class="notification is-light">
              <p class="has-text-centered">
                <span class="icon is-large"><i class="fas fa-running fa-2x"></i></span>
              </p>
              <p class="has-text-centered">
                No activities yet. Start tracking your fitness journey!
              </p>
            </div>

            <div
              v-for="activity in visibleActivities"
              :key="activity.id"
              :ref="(el) => setPostRef(el as HTMLElement, activity.id)"
              class="post-wrapper"
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
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── GRID VIEW (Instagram-style) ───────────────────────────────────── -->
      <template v-if="viewMode === 'grid'">
        <div v-if="sortedActivities.length === 0" class="notification is-light has-text-centered">
          No activities yet.
        </div>
        <div class="grid-layout">
          <div
            v-for="activity in visibleActivities"
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
            <div
              v-if="sortedActivities.length === 0"
              class="notification is-light has-text-centered"
            >
              No activities yet.
            </div>
            <div
              v-for="activity in visibleActivities"
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

      <!-- Sentinel (shared across all views) -->
      <div ref="sentinel" class="sentinel" />

      <!-- Loading -->
      <div v-if="hasMore" class="has-text-centered py-4">
        <span class="icon has-text-grey"><i class="fas fa-spinner fa-pulse"></i></span>
        <p class="has-text-grey is-size-7 mt-1">Loading more activities…</p>
      </div>

      <!-- All loaded -->
      <div v-else-if="sortedActivities.length > PAGE_SIZE" class="has-text-centered py-4">
        <p class="has-text-grey is-size-7">
          <span class="icon is-small"><i class="fas fa-check-circle"></i></span>
          All {{ sortedActivities.length }} activities loaded
        </p>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <PostDetailModal
      :post="detailPost"
      :is-open="detailPost !== null"
      :is-owner="true"
      @close="closeDetail"
    />

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
.sentinel {
  height: 1px;
}

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
</style>
