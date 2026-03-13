<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUsersStore } from '@/stores/usersStores'
import EditProfileForm from '@/components/EditProfileForm.vue'
import UserListModal from '@/components/UserListModal.vue'
import FindPeopleModal from '@/components/FindPeopleModal.vue'
import UserCard from '@/components/UserCard.vue'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()
const router = useRouter()

const userPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

const totalActivities = computed(() => userPosts.value.length)

// ============================================================================
// USER LIST MODALS
// ============================================================================
const activeModal = ref<'following' | 'followers' | 'find' | null>(null)

function openModal(type: 'following' | 'followers' | 'find') {
  activeModal.value = type
}

function closeUserModal() {
  activeModal.value = null
}

// ============================================================================
// DISCOVER TEASER — top 3 suggestions
// ============================================================================
const suggestedUsers = computed(() => {
  if (!authStore.currentUser) return []
  const me = authStore.currentUser
  const myFollowing = new Set(me.following ?? [])
  const myFollowers = new Set(me.followers ?? [])
  const friendsOfFriends = new Set<number>()
  usersStore.users
    .filter((u) => myFollowing.has(u.id))
    .forEach((u) => {
      ;(u.following ?? []).forEach((id) => {
        if (id !== me.id && !myFollowing.has(id)) friendsOfFriends.add(id)
      })
    })
  return usersStore.users
    .filter((u) => u.id !== me.id && !myFollowing.has(u.id))
    .map((u) => {
      let priority = 3
      if (myFollowers.has(u.id)) priority = 1
      else if (friendsOfFriends.has(u.id)) priority = 2
      return { user: u, priority }
    })
    .sort((a, b) => a.priority - b.priority)
    .map((x) => x.user)
    .slice(0, 3)
})

// ============================================================================
// EDIT MODAL
// ============================================================================
const isEditModalOpen = ref(false)

function openEditModal() {
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function handleEditSubmit(formData: {
  firstName: string
  username: string
  image: string
  role: string
}) {
  if (!authStore.currentUser) return
  usersStore.updateUser(authStore.currentUser.id, formData)
  // Sync the change back into authStore so the UI updates everywhere
  authStore.currentUser = {
    ...authStore.currentUser,
    ...formData,
  }
  closeEditModal()
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
          <div class="notification is-warning has-text-centered">
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
          <!-- Profile Card -->
          <div class="box mb-5">
            <div class="media">
              <div class="media-left">
                <figure class="image is-128x128">
                  <img
                    v-if="authStore.currentUser?.image"
                    class="is-rounded"
                    :src="authStore.currentUser?.image"
                    :alt="authStore.currentUser?.firstName"
                  />
                  <span v-else class="icon has-text-grey-light" style="font-size: 8rem">
                    <i class="fas fa-user-circle"></i>
                  </span>
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-3">{{ authStore.currentUser?.firstName }}</p>
                <p class="subtitle is-5 has-text-grey">@{{ authStore.currentUser?.username }}</p>
                <span class="tag is-info is-medium is-rounded">
                  <span class="icon"><i class="fas fa-user-tag"></i></span>
                  <span>{{ authStore.currentUser?.role }}</span>
                </span>
              </div>
              <!-- Edit & Delete buttons top right -->
              <div class="media-right">
                <div class="buttons">
                  <button class="button is-info is-outlined is-small" @click="openEditModal">
                    <span class="icon"><i class="fas fa-edit"></i></span>
                    <span>Edit</span>
                  </button>
                  <button class="button is-danger is-outlined is-small" @click="deleteAccount">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="columns mb-5">
            <div class="column">
              <div class="box has-text-centered stat-btn" @click="openModal('following')">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-user-friends"></i></span>
                  Following
                </p>
                <p class="title is-3 has-text-info">
                  {{ authStore.currentUser?.following?.length || 0 }}
                </p>
                <p class="heading has-text-grey-light is-size-7">click to view</p>
              </div>
            </div>
            <div class="column">
              <div class="box has-text-centered stat-btn" @click="openModal('followers')">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-users"></i></span>
                  Followers
                </p>
                <p class="title is-3 has-text-success">
                  {{ authStore.currentUser?.followers?.length || 0 }}
                </p>
                <p class="heading has-text-grey-light is-size-7">click to view</p>
              </div>
            </div>
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-dumbbell"></i></span>
                  Activities
                </p>
                <p class="title is-3 has-text-info">{{ totalActivities }}</p>
              </div>
            </div>
            <div class="column">
              <div class="box has-text-centered stat-btn" @click="openModal('find')">
                <p class="heading has-text-grey">
                  <span class="icon has-text-warning"><i class="fas fa-compass"></i></span>
                  Find People
                </p>
                <p class="title is-3 has-text-warning">
                  <span class="icon"><i class="fas fa-search"></i></span>
                </p>
                <p class="heading has-text-grey-light is-size-7">click to discover</p>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="box">
            <p class="heading has-text-grey mb-4">
              <span class="icon has-text-info"><i class="fas fa-link"></i></span>
              Quick Links
            </p>
            <div class="buttons">
              <router-link to="/User/MyActivity" class="button is-primary is-outlined">
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

          <!-- People You Might Know Teaser -->
          <div v-if="suggestedUsers.length" class="box mt-5">
            <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
              <p class="heading has-text-grey mb-0">
                <span class="icon has-text-info"><i class="fas fa-compass"></i></span>
                People You Might Know
              </p>
              <router-link to="/User/Discover" class="is-size-7 has-text-info">
                See more <span class="icon is-small"><i class="fas fa-arrow-right"></i></span>
              </router-link>
            </div>
            <UserCard v-for="user in suggestedUsers" :key="user.id" :user="user" />
          </div>
        </div>
      </div>
    </div>

    <!-- Following / Followers Modals -->
    <UserListModal
      title="Following"
      :user-ids="authStore.currentUser?.following ?? []"
      :is-open="activeModal === 'following'"
      @close="closeUserModal"
    />
    <UserListModal
      title="Followers"
      :user-ids="authStore.currentUser?.followers ?? []"
      :is-open="activeModal === 'followers'"
      @close="closeUserModal"
    />

    <!-- Find People Modal -->
    <FindPeopleModal :is-open="activeModal === 'find'" @close="closeUserModal" />

    <!-- Edit Profile Modal -->
    <div class="modal" :class="{ 'is-active': isEditModalOpen }">
      <div class="modal-background" @click="closeEditModal"></div>
      <div class="modal-content">
        <EditProfileForm
          v-if="authStore.currentUser"
          :user="authStore.currentUser"
          :show-role="false"
          @submit="handleEditSubmit"
          @cancel="closeEditModal"
        />
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeEditModal"></button>
    </div>
  </main>
</template>

<style scoped>
.image.is-128x128 img {
  width: 128px;
  height: 128px;
  object-fit: cover;
}

.box {
  transition: box-shadow 0.2s;
}

.box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-btn {
  cursor: pointer;
}

.stat-btn:hover {
  border-color: hsl(204, 86%, 53%);
}
</style>
