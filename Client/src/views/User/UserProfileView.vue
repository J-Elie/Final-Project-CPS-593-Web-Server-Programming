<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'
import { usePostsStore } from '@/stores/postsStore'
import PostDetailModal from '@/components/modal/PostDetailModal.vue'
import type { Post } from '@/types/posts'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const postsStore = usePostsStore()

// ============================================================================
// USER
// ============================================================================
const userId = computed(() => Number(route.params.id))
const user = computed(() => usersStore.users.find((u) => u.id === userId.value) ?? null)
const isMe = computed(() => authStore.currentUser?.id === userId.value)

watch(
  isMe,
  (val) => {
    if (val) router.replace('/User/Profile')
  },
  { immediate: true },
)

// ============================================================================
// FOLLOW
// ============================================================================
const isFollowing = computed(
  () => authStore.currentUser?.following?.includes(userId.value) ?? false,
)

function toggleFollow() {
  if (!authStore.currentUser) return
  const following = [...(authStore.currentUser.following ?? [])]
  const idx = following.indexOf(userId.value)
  if (idx === -1) following.push(userId.value)
  else following.splice(idx, 1)
  authStore.currentUser = { ...authStore.currentUser, following }
}

// ============================================================================
// POSTS
// ============================================================================
const userPosts = computed(() =>
  postsStore
    .getPostsByUserId(userId.value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
)

const totalLikes = computed(() =>
  userPosts.value.reduce((sum, p) => sum + (p.likes?.length ?? 0), 0),
)

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
  Other: 'fa-heartbeat',
}

function typeIcon(type: string) {
  return activityIcons[type] ?? 'fa-heartbeat'
}

// ============================================================================
// POST DETAIL MODAL
// ============================================================================
const detailPost = ref<Post | null>(null)
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Not found -->
      <div v-if="!user" class="columns is-centered">
        <div class="column is-half has-text-centered">
          <div class="notification is-warning">
            <p class="is-size-5">
              <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
              User not found.
            </p>
          </div>
          <button class="button is-info is-outlined mt-3" @click="router.back()">
            <span class="icon"><i class="fas fa-arrow-left"></i></span>
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <div v-else class="columns is-centered">
        <div class="column is-three-quarters">
          <!-- Back -->
          <div class="mb-4">
            <button class="button is-light is-small" @click="router.back()">
              <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
              <span>Back</span>
            </button>
          </div>

          <!-- ── Profile Header (Instagram-style) ──────────────────────── -->
          <div class="profile-header mb-4">
            <!-- Avatar -->
            <div class="profile-avatar-wrap">
              <figure class="image is-128x128">
                <img
                  v-if="user.image"
                  class="is-rounded profile-avatar"
                  :src="user.image"
                  :alt="user.firstName"
                />
                <span v-else class="icon has-text-grey-light" style="font-size: 8rem">
                  <i class="fas fa-user-circle"></i>
                </span>
              </figure>
            </div>

            <!-- Info -->
            <div class="profile-info">
              <!-- Name row + follow button -->
              <div class="is-flex is-align-items-center mb-2" style="gap: 1rem; flex-wrap: wrap">
                <p class="title is-4 mb-0">{{ user.firstName }}</p>
                <p class="has-text-grey mb-0">@{{ user.username }}</p>
                <button
                  class="button is-small"
                  :class="isFollowing ? 'is-info' : 'is-info is-outlined'"
                  @click="toggleFollow"
                >
                  <span class="icon is-small">
                    <i :class="isFollowing ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
                  </span>
                  <span>{{ isFollowing ? 'Following' : 'Follow' }}</span>
                </button>
              </div>

              <!-- Inline stats row -->
              <div class="profile-stats mb-3">
                <div class="profile-stat">
                  <span class="has-text-weight-bold">{{ userPosts.length }}</span>
                  <span class="has-text-grey is-size-7 ml-1">posts</span>
                </div>
                <div class="profile-stat">
                  <span class="has-text-weight-bold">{{ user.followers?.length ?? 0 }}</span>
                  <span class="has-text-grey is-size-7 ml-1">followers</span>
                </div>
                <div class="profile-stat">
                  <span class="has-text-weight-bold">{{ user.following?.length ?? 0 }}</span>
                  <span class="has-text-grey is-size-7 ml-1">following</span>
                </div>
                <div class="profile-stat">
                  <span class="has-text-weight-bold has-text-success">{{ totalLikes }}</span>
                  <span class="has-text-grey is-size-7 ml-1">likes</span>
                </div>
              </div>

              <!-- Role tag -->
              <span class="tag is-info is-rounded mb-2">
                <span class="icon is-small"><i class="fas fa-user-tag"></i></span>
                <span>{{ user.role }}</span>
              </span>

              <!-- Bio -->
              <p v-if="user.bio" class="has-text-grey mt-2 is-size-6">{{ user.bio }}</p>
              <p v-else class="has-text-grey-light is-italic mt-2 is-size-7">No bio yet.</p>
            </div>
          </div>

          <!-- ── Divider ────────────────────────────────────────────────── -->
          <hr class="mb-0" />

          <!-- ── Post Grid (flush, no box) ─────────────────────────────── -->
          <div v-if="userPosts.length === 0" class="notification is-light has-text-centered mt-4">
            <span class="icon"><i class="fas fa-dumbbell"></i></span>
            No activities yet.
          </div>

          <div v-else class="post-grid mt-1">
            <div
              v-for="post in userPosts"
              :key="post.id"
              class="post-tile"
              @click="detailPost = post"
            >
              <!-- Image or icon placeholder -->
              <div class="tile-media">
                <img v-if="post.picture" :src="post.picture" :alt="post.title" />
                <div v-else class="tile-placeholder">
                  <span class="icon has-text-info" style="font-size: 2.5rem">
                    <i :class="`fas ${typeIcon(post.type)}`"></i>
                  </span>
                </div>
              </div>

              <!-- Hover overlay -->
              <div class="tile-overlay">
                <p class="has-text-white has-text-weight-bold is-size-7 tile-title mb-1">
                  {{ post.title }}
                </p>
                <div class="is-flex" style="gap: 0.75rem">
                  <span class="has-text-white is-size-7">
                    <i class="fas fa-heart"></i> {{ post.likes?.length ?? 0 }}
                  </span>
                  <span class="has-text-white is-size-7">
                    <i class="fas fa-comment"></i> {{ post.comments?.length ?? 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <PostDetailModal
      :post="detailPost"
      :is-open="detailPost !== null"
      :is-owner="false"
      @close="detailPost = null"
    />
  </main>
</template>

<style scoped>
/* ── Profile header layout ───────────────────────────────────────────────── */
.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

.profile-avatar-wrap {
  flex-shrink: 0;
}

.profile-avatar {
  width: 128px;
  height: 128px;
  object-fit: cover;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

/* Inline stats */
.profile-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.profile-stat {
  display: flex;
  align-items: baseline;
}

/* ── Post grid ───────────────────────────────────────────────────────────── */
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}

@media (max-width: 600px) {
  .post-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .profile-stats {
    justify-content: center;
  }
}

.post-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
  background: hsl(0, 0%, 93%);
}

.tile-media {
  width: 100%;
  height: 100%;
}

.tile-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(204, 86%, 97%);
}

.tile-overlay {
  position: absolute;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.post-tile:hover .tile-overlay {
  opacity: 1;
}

.tile-title {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
