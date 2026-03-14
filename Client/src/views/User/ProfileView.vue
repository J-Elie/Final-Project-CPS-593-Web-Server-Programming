<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import EditProfileForm from '@/components/EditProfileForm.vue'
import EditButton from '@/components/ui/buttons/EditButton.vue'
import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
import PeopleManagerModal from '@/components/modal/PeopleManagerModal.vue'
import type { Post } from '@/types/posts'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()
const router = useRouter()

// ============================================================================
// POSTS
// ============================================================================
const userPosts = computed<Post[]>(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

const totalActivities = computed(() => userPosts.value.length)

const totalLikes = computed(() =>
  userPosts.value.reduce((sum, p) => sum + (p.likes?.length ?? 0), 0),
)

const totalComments = computed(() =>
  userPosts.value.reduce((sum, p) => sum + (p.comments?.length ?? 0), 0),
)

const mostPopularPost = computed(() =>
  userPosts.value.reduce<Post | null>((best, p) => {
    if (!best) return p
    return (p.likes?.length ?? 0) > (best.likes?.length ?? 0) ? p : best
  }, null),
)

const mostUsedType = computed(() => {
  const counts: Record<string, number> = {}
  userPosts.value.forEach((p) => {
    counts[p.type] = (counts[p.type] ?? 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
})

const totalMinutes = computed(() =>
  userPosts.value.reduce((sum, p) => sum + Number(p.duration ?? 0), 0),
)

const totalTime = computed(() => {
  const mins = totalMinutes.value
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
})

// Most recent 3 posts for mini cards
const recentPosts = computed(() =>
  [...userPosts.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3),
)

const activityTypeIcon: Record<string, string> = {
  Running: 'fa-running',
  Cycling: 'fa-biking',
  Swimming: 'fa-swimmer',
  Yoga: 'fa-spa',
  Weightlifting: 'fa-dumbbell',
  Hiking: 'fa-hiking',
  Other: 'fa-heartbeat',
}

function typeIcon(type: string) {
  return activityTypeIcon[type] ?? 'fa-heartbeat'
}

function goToPost(postId: number) {
  router.push(`/User/MyActivity?post=${postId}`)
}

// ============================================================================
// PEOPLE MODAL
// ============================================================================
type PeopleTab = 'following' | 'followers' | 'find'
const isPeopleModalOpen = ref(false)
const peopleModalTab = ref<PeopleTab>('following')

function openPeopleModal(tab: PeopleTab) {
  peopleModalTab.value = tab
  isPeopleModalOpen.value = true
}

// ============================================================================
// SUGGESTIONS count for Find People box
// ============================================================================
const suggestionsCount = computed(() => {
  if (!authStore.currentUser) return 0
  const myFollowing = new Set(authStore.currentUser.following ?? [])
  return usersStore.users.filter(
    (u) => u.id !== authStore.currentUser!.id && !myFollowing.has(u.id),
  ).length
})

// ============================================================================
// EDIT PROFILE
// ============================================================================
const isEditModalOpen = ref(false)

function handleEditSubmit(formData: {
  firstName: string
  username: string
  image: string
  role: string
}) {
  if (!authStore.currentUser) return
  usersStore.updateUser(authStore.currentUser.id, formData)
  authStore.currentUser = { ...authStore.currentUser, ...formData }
  isEditModalOpen.value = false
}

// ============================================================================
// DELETE ACCOUNT
// ============================================================================
function deleteAccount() {
  if (!authStore.currentUser) return
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
  const id = authStore.currentUser.id
  authStore.logout()
  usersStore.deleteUser(id)
  router.push('/')
}
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Page Header -->
      <h1 class="title is-2 has-text-centered">
        <span class="icon-text is-justify-content-center">
          <span class="icon has-text-info mr-4">
            <i class="fas fa-user-circle"></i>
          </span>
          <span>My Profile</span>
        </span>
      </h1>
      <p class="subtitle has-text-centered">View and manage your account</p>

      <!-- Not Logged In -->
      <div v-if="!authStore.isLoggedIn" class="columns is-centered">
        <div class="column is-three-quarters">
          <div class="notification is-success has-text-centered">
            <p class="is-size-5">
              <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
              Please <router-link to="/login">log in</router-link> to view your profile.
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="columns is-centered">
        <div class="column is-three-quarters">
          <!-- ── Profile Card ───────────────────────────────────────────── -->
          <div class="box mb-5">
            <div class="media">
              <div class="media-left">
                <figure class="image is-128x128">
                  <img
                    v-if="authStore.currentUser?.image"
                    class="is-rounded profile-avatar"
                    :src="authStore.currentUser?.image"
                    :alt="authStore.currentUser?.firstName"
                  />
                  <span v-else class="icon has-text-grey-light" style="font-size: 8rem">
                    <i class="fas fa-user-circle"></i>
                  </span>
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-3 mb-1">{{ authStore.currentUser?.firstName }}</p>
                <p class="subtitle is-5 has-text-grey mb-2">
                  @{{ authStore.currentUser?.username }}
                </p>
                <span class="tag is-info is-medium is-rounded mb-3">
                  <span class="icon"><i class="fas fa-user-tag"></i></span>
                  <span>{{ authStore.currentUser?.role }}</span>
                </span>
                <!-- About Me -->
                <p v-if="authStore.currentUser?.bio" class="has-text-grey mt-2">
                  {{ authStore.currentUser.bio }}
                </p>
                <p v-else class="has-text-grey-light is-italic mt-2 is-size-7">
                  No bio yet — click Edit to add one.
                </p>
              </div>
              <div class="media-right">
                <div class="buttons">
                  <EditButton :small="true" @click="isEditModalOpen = true" />
                  <DeleteButton label="Delete Account" :small="true" @click="deleteAccount" />
                </div>
              </div>
            </div>
          </div>

          <!-- ── People Stats Row (equal width, 3 boxes) ───────────────── -->
          <div class="columns is-mobile mb-5">
            <div class="column">
              <div
                class="box has-text-centered stat-btn"
                style="height: 100%"
                @click="openPeopleModal('following')"
              >
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-user-friends"></i></span>
                  Following
                </p>
                <p class="title is-3 has-text-info">
                  {{ authStore.currentUser?.following?.length ?? 0 }}
                </p>
                <p class="heading has-text-grey-light is-size-7">click to view</p>
              </div>
            </div>
            <div class="column">
              <div
                class="box has-text-centered stat-btn"
                style="height: 100%"
                @click="openPeopleModal('followers')"
              >
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-users"></i></span>
                  Followers
                </p>
                <p class="title is-3 has-text-success">
                  {{ authStore.currentUser?.followers?.length ?? 0 }}
                </p>
                <p class="heading has-text-grey-light is-size-7">click to view</p>
              </div>
            </div>
            <div class="column">
              <div
                class="box has-text-centered stat-btn"
                style="height: 100%"
                @click="openPeopleModal('find')"
              >
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-compass"></i></span>
                  Find People
                </p>
                <p class="title is-3 has-text-success">{{ suggestionsCount }}</p>
                <p class="heading has-text-grey-light is-size-7">click to discover</p>
              </div>
            </div>
          </div>

          <!-- ── Activity Stats ─────────────────────────────────────────── -->
          <div class="box mb-5">
            <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
              <p class="heading has-text-grey mb-0">
                <span class="icon has-text-info"><i class="fas fa-dumbbell"></i></span>
                Activity Stats
              </p>
              <router-link to="/User/MyActivity" class="is-size-7 has-text-info">
                Manage activities
                <span class="icon is-small"><i class="fas fa-arrow-right"></i></span>
              </router-link>
            </div>

            <!-- 5 stat tiles -->
            <div class="columns is-mobile is-multiline mb-4">
              <div class="column is-one-fifth-tablet is-half-mobile">
                <div class="has-text-centered">
                  <p class="heading has-text-grey">Posts</p>
                  <p class="title is-4 has-text-info">{{ totalActivities }}</p>
                </div>
              </div>
              <div class="column is-one-fifth-tablet is-half-mobile">
                <div class="has-text-centered">
                  <p class="heading has-text-grey">Total Likes</p>
                  <p class="title is-4 has-text-info">{{ totalLikes }}</p>
                </div>
              </div>
              <div class="column is-one-fifth-tablet is-half-mobile">
                <div class="has-text-centered">
                  <p class="heading has-text-grey">Comments</p>
                  <p class="title is-4 has-text-info">{{ totalComments }}</p>
                </div>
              </div>
              <div class="column is-one-fifth-tablet is-half-mobile">
                <div class="has-text-centered">
                  <p class="heading has-text-grey">Fav Type</p>
                  <p class="title is-4 has-text-success is-size-6">{{ mostUsedType }}</p>
                </div>
              </div>
              <div class="column is-one-fifth-tablet is-half-mobile">
                <div class="has-text-centered">
                  <p class="heading has-text-grey">Total Time</p>
                  <p class="title is-4 has-text-success">{{ totalTime }}</p>
                </div>
              </div>
            </div>

            <!-- Most popular post -->
            <div
              v-if="mostPopularPost"
              class="notification is-light is-info py-3 px-4 popular-post"
              @click="goToPost(mostPopularPost.id)"
            >
              <p class="heading has-text-grey mb-1">
                <span class="icon is-small"><i class="fas fa-star has-text-success"></i></span>
                Most Popular Post — click to view
              </p>
              <div class="is-flex is-align-items-center" style="gap: 0.75rem">
                <span class="icon has-text-info is-medium">
                  <i :class="`fas ${typeIcon(mostPopularPost.type)} fa-lg`"></i>
                </span>
                <div>
                  <p class="has-text-weight-semibold">{{ mostPopularPost.title }}</p>
                  <p class="is-size-7 has-text-grey">
                    {{ mostPopularPost.type }} · {{ mostPopularPost.duration }} mins
                    <span class="ml-2">
                      <span class="icon is-small has-text-info"><i class="fas fa-heart"></i></span>
                      {{ mostPopularPost.likes?.length ?? 0 }} likes
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Mini post cards -->
            <p class="heading has-text-grey mt-4 mb-3">
              <span class="icon"><i class="fas fa-clock"></i></span>
              Recent Posts
            </p>
            <div v-if="recentPosts.length === 0" class="has-text-centered has-text-grey-light py-3">
              No activities yet.
            </div>
            <div class="columns is-multiline">
              <div v-for="post in recentPosts" :key="post.id" class="column is-one-third">
                <div class="box mini-card" style="cursor: pointer" @click="goToPost(post.id)">
                  <div class="is-flex is-align-items-center mb-2" style="gap: 0.5rem">
                    <span class="icon has-text-info">
                      <i :class="`fas ${typeIcon(post.type)}`"></i>
                    </span>
                    <p class="has-text-weight-semibold is-size-7 mini-title">{{ post.title }}</p>
                  </div>
                  <p class="is-size-7 has-text-grey">{{ post.type }} · {{ post.duration }} mins</p>
                  <div class="is-flex mt-2" style="gap: 0.75rem">
                    <span class="is-size-7 has-text-info">
                      <i class="fas fa-heart"></i> {{ post.likes?.length ?? 0 }}
                    </span>
                    <span class="is-size-7 has-text-grey">
                      <i class="fas fa-comment"></i> {{ post.comments?.length ?? 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Quick Links ─────────────────────────────────────────────── -->
          <div class="box">
            <p class="heading has-text-grey mb-4">
              <span class="icon has-text-info"><i class="fas fa-link"></i></span>
              Quick Links
            </p>
            <div class="buttons">
              <router-link to="/User/MyActivity" class="button is-info is-outlined">
                <span class="icon"><i class="fas fa-running"></i></span>
                <span>My Activities</span>
              </router-link>
              <router-link to="/User/MyStatistics" class="button is-info is-outlined">
                <span class="icon"><i class="fas fa-chart-bar"></i></span>
                <span>My Statistics</span>
              </router-link>
              <router-link to="/User/ActivityFeed" class="button is-success is-outlined">
                <span class="icon"><i class="fas fa-users"></i></span>
                <span>Friends Feed</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── People Manager Modal ───────────────────────────────────────────── -->
    <PeopleManagerModal
      :is-open="isPeopleModalOpen"
      :initial-tab="peopleModalTab"
      @close="isPeopleModalOpen = false"
    />

    <!-- ── Edit Profile Modal ─────────────────────────────────────────────── -->
    <div class="modal" :class="{ 'is-active': isEditModalOpen }">
      <div class="modal-background" @click="isEditModalOpen = false" />
      <div class="modal-content">
        <EditProfileForm
          v-if="authStore.currentUser"
          :user="authStore.currentUser"
          :show-role="false"
          @submit="handleEditSubmit"
          @cancel="isEditModalOpen = false"
        />
      </div>
      <button class="modal-close is-large" aria-label="close" @click="isEditModalOpen = false" />
    </div>
  </main>
</template>

<style scoped>
.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.box {
  transition: box-shadow 0.2s;
}
.box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* All three people boxes same height via flexbox column */
.columns.is-mobile .column {
  display: flex;
  flex-direction: column;
}

.stat-btn {
  cursor: pointer;
  flex: 1;
}
.stat-btn:hover {
  border-color: hsl(204, 86%, 53%);
}

/* Mini post cards */
.mini-card {
  padding: 0.75rem;
  height: 100%;
}

.mini-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.popular-post {
  cursor: pointer;
  transition: opacity 0.15s;
}
.popular-post:hover {
  opacity: 0.85;
}
</style>
