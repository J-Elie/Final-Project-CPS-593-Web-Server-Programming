<script setup lang="ts">
/**
 * PeopleManagerModal.vue
 * ======================
 * Tabbed modal: Following | Followers | Find People
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'
import StatusTag from '@/components/ui/StatusTag.vue'

type Tab = 'following' | 'followers' | 'find'

const props = defineProps<{
  isOpen: boolean
  initialTab?: Tab
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const usersStore = useUsersStore()
const router = useRouter()

// ============================================================================
// TABS
// ============================================================================
const activeTab = ref<Tab>(props.initialTab ?? 'following')
const searchQuery = ref('')
const openDropdownId = ref<number | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      activeTab.value = props.initialTab ?? 'following'
      searchQuery.value = ''
      openDropdownId.value = null
    }
  },
)

function switchTab(tab: Tab) {
  activeTab.value = tab
  searchQuery.value = ''
  openDropdownId.value = null
}

// ============================================================================
// HELPERS
// ============================================================================
function isMutual(userId: number): boolean {
  const me = authStore.currentUser
  if (!me) return false
  return (me.following ?? []).includes(userId) && (me.followers ?? []).includes(userId)
}

function isFollowing(userId: number): boolean {
  return authStore.currentUser?.following?.includes(userId) ?? false
}

// ============================================================================
// FOLLOWING LIST
// ============================================================================
const followingUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return (authStore.currentUser?.following ?? [])
    .map((id) => usersStore.users.find((u) => u.id === id))
    .filter(Boolean)
    .filter(
      (u) => !q || u!.firstName.toLowerCase().includes(q) || u!.username.toLowerCase().includes(q),
    )
})

// ============================================================================
// FOLLOWERS LIST
// ============================================================================
const followerUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return (authStore.currentUser?.followers ?? [])
    .map((id) => usersStore.users.find((u) => u.id === id))
    .filter(Boolean)
    .filter(
      (u) => !q || u!.firstName.toLowerCase().includes(q) || u!.username.toLowerCase().includes(q),
    )
})

// ============================================================================
// FIND PEOPLE — ranked suggestions
// 1: follows you  2: friend of friend  3: everyone else
// ============================================================================
const suggestedUsers = computed(() => {
  if (!authStore.currentUser) return []
  const me = authStore.currentUser
  const myFollowing = new Set(me.following ?? [])
  const myFollowers = new Set(me.followers ?? [])

  const friendsOfFriends = new Set<number>()
  usersStore.users
    .filter((u) => myFollowing.has(u.id))
    .forEach((u) =>
      (u.following ?? []).forEach((id) => {
        if (id !== me.id && !myFollowing.has(id)) friendsOfFriends.add(id)
      }),
    )

  const q = searchQuery.value.trim().toLowerCase()
  const pool = q
    ? usersStore.users.filter((u) => u.id !== me.id)
    : usersStore.users.filter((u) => u.id !== me.id && !myFollowing.has(u.id))

  return pool
    .filter(
      (u) => !q || u.firstName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
    )
    .map((u) => {
      let priority = 3
      if (myFollowers.has(u.id)) priority = 1
      else if (friendsOfFriends.has(u.id)) priority = 2
      return { user: u, priority }
    })
    .sort((a, b) => a.priority - b.priority)
    .map((x) => x.user)
})

function findTag(userId: number): { label: string; variant: 'success' | 'info' } | null {
  if (searchQuery.value.trim()) return null
  const me = authStore.currentUser
  if (!me) return null
  if (me.followers?.includes(userId)) return { label: 'Follows you', variant: 'success' }
  const myFollowing = new Set(me.following ?? [])
  const isFoF = usersStore.users
    .filter((u) => myFollowing.has(u.id))
    .some((u) => u.following?.includes(userId))
  if (isFoF) return { label: 'Mutual friend', variant: 'info' }
  return null
}

const emptyMessage = computed(() => {
  const q = searchQuery.value.trim()
  if (q) return `No results for "${q}"`
  if (activeTab.value === 'following') return "You're not following anyone yet."
  if (activeTab.value === 'followers') return 'You have no followers yet.'
  return 'No suggestions right now.'
})

// ============================================================================
// ACTIONS
// ============================================================================
function toggleFollow(userId: number) {
  if (!authStore.currentUser) return
  const following = [...(authStore.currentUser.following ?? [])]
  const idx = following.indexOf(userId)
  if (idx === -1) following.push(userId)
  else following.splice(idx, 1)
  authStore.currentUser = { ...authStore.currentUser, following }
  openDropdownId.value = null
}

function removeFollower(userId: number) {
  if (!authStore.currentUser) return
  const followers = (authStore.currentUser.followers ?? []).filter((id) => id !== userId)
  authStore.currentUser = { ...authStore.currentUser, followers }
  openDropdownId.value = null
}

function blockUser() {
  // placeholder — no implementation yet
  openDropdownId.value = null
}

function toggleDropdown(id: number) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

// ============================================================================
// NAVIGATION — clicking a row goes to their profile
// ============================================================================
function goToProfile(userId: number) {
  router.push(`/User/Profile/${userId}`)
  handleClose()
}

function goToActivities(userId: number) {
  router.push(`/User/Activities/${userId}`)
  handleClose()
}

function handleClose() {
  searchQuery.value = ''
  openDropdownId.value = null
  emit('close')
}

// Close dropdown when clicking outside
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="handleClose" />
    <div class="modal-card people-modal-card">
      <!-- ── HEADER ─────────────────────────────────────────────────────── -->
      <header class="modal-card-head modal-head-col">
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-4 px-1">
          <p class="modal-card-title mb-0">
            <span class="icon has-text-info"><i class="fas fa-users"></i></span>
            People
          </p>
          <button class="delete is-medium" aria-label="close" @click="handleClose" />
        </div>

        <!-- Tabs — active tab gets is-info background -->
        <div class="tabs is-boxed is-fullwidth mb-0 tab-strip">
          <ul>
            <li :class="{ 'is-active tab-active': activeTab === 'following' }">
              <a @click="switchTab('following')">
                <span class="icon is-small"><i class="fas fa-user-friends"></i></span>
                <span>Following</span>
                <span class="tab-count ml-2">{{
                  authStore.currentUser?.following?.length ?? 0
                }}</span>
              </a>
            </li>
            <li :class="{ 'is-active tab-active': activeTab === 'followers' }">
              <a @click="switchTab('followers')">
                <span class="icon is-small"><i class="fas fa-users"></i></span>
                <span>Followers</span>
                <span class="tab-count ml-2">{{
                  authStore.currentUser?.followers?.length ?? 0
                }}</span>
              </a>
            </li>
            <li :class="{ 'is-active tab-active': activeTab === 'find' }">
              <a @click="switchTab('find')">
                <span class="icon is-small"><i class="fas fa-compass"></i></span>
                <span>Find People</span>
              </a>
            </li>
          </ul>
        </div>
      </header>

      <!-- ── BODY ───────────────────────────────────────────────────────── -->
      <section class="modal-card-body">
        <!-- Search -->
        <div class="field mb-4">
          <div class="control has-icons-left has-icons-right">
            <input
              class="input"
              type="text"
              :placeholder="activeTab === 'find' ? 'Search all users…' : 'Search…'"
              v-model="searchQuery"
            />
            <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
            <span
              v-if="searchQuery"
              class="icon is-small is-right clear-btn"
              @click="searchQuery = ''"
            >
              <i class="fas fa-times"></i>
            </span>
          </div>
        </div>

        <!-- Find People label -->
        <p
          v-if="activeTab === 'find' && !searchQuery && suggestedUsers.length"
          class="heading has-text-grey mb-3"
        >
          <span class="icon"><i class="fas fa-star has-text-warning"></i></span>
          Suggested for you
        </p>

        <!-- ── FOLLOWING TAB ──────────────────────────────────────────── -->
        <template v-if="activeTab === 'following'">
          <div v-if="followingUsers.length === 0" class="has-text-centered py-6">
            <span class="icon is-large has-text-grey-light"
              ><i class="fas fa-user-slash fa-2x"></i
            ></span>
            <p class="has-text-grey mt-3">{{ emptyMessage }}</p>
          </div>

          <div
            v-for="user in followingUsers"
            :key="user!.id"
            class="media user-row"
            style="cursor: pointer"
            @click="goToProfile(user!.id)"
          >
            <div class="media-left">
              <figure class="image is-48x48">
                <img
                  v-if="user!.image"
                  class="is-rounded avatar-img"
                  :src="user!.image"
                  :alt="user!.firstName"
                />
                <span v-else class="icon has-text-grey-light is-size-1"
                  ><i class="fas fa-user-circle"></i
                ></span>
              </figure>
            </div>
            <div class="media-content" style="overflow: hidden">
              <p class="has-text-weight-semibold">{{ user!.firstName }}</p>
              <p class="has-text-grey is-size-7">@{{ user!.username }}</p>
              <div class="tags mt-1" style="gap: 0.25rem; margin-bottom: 0">
                <StatusTag :label="user!.role" variant="info" size="small" />
                <StatusTag
                  v-if="isMutual(user!.id)"
                  label="Mutual"
                  variant="success"
                  size="small"
                />
              </div>
            </div>
            <div class="media-right" @click.stop>
              <div class="is-flex is-align-items-center" style="gap: 0.5rem">
                <EditButton
                  label="Unfollow"
                  icon="fas fa-user-minus"
                  :small="true"
                  @click="toggleFollow(user!.id)"
                />
                <div class="dropdown" :class="{ 'is-active': openDropdownId === user!.id }">
                  <div class="dropdown-trigger">
                    <button class="button is-small is-light" @click.stop="toggleDropdown(user!.id)">
                      <span class="icon is-small"><i class="fas fa-ellipsis-v"></i></span>
                    </button>
                  </div>
                  <div class="dropdown-menu">
                    <div class="dropdown-content">
                      <a class="dropdown-item has-text-danger" @click="toggleFollow(user!.id)">
                        <span class="icon is-small has-text-danger"
                          ><i class="fas fa-user-minus"></i
                        ></span>
                        Unfollow
                      </a>
                      <a class="dropdown-item has-text-danger" @click="blockUser()">
                        <span class="icon is-small has-text-danger"
                          ><i class="fas fa-ban"></i
                        ></span>
                        Block
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── FOLLOWERS TAB ─────────────────────────────────────────── -->
        <template v-if="activeTab === 'followers'">
          <div v-if="followerUsers.length === 0" class="has-text-centered py-6">
            <span class="icon is-large has-text-grey-light"
              ><i class="fas fa-user-slash fa-2x"></i
            ></span>
            <p class="has-text-grey mt-3">{{ emptyMessage }}</p>
          </div>

          <div
            v-for="user in followerUsers"
            :key="user!.id"
            class="media user-row"
            style="cursor: pointer"
            @click="goToProfile(user!.id)"
          >
            <div class="media-left">
              <figure class="image is-48x48">
                <img
                  v-if="user!.image"
                  class="is-rounded avatar-img"
                  :src="user!.image"
                  :alt="user!.firstName"
                />
                <span v-else class="icon has-text-grey-light is-size-1"
                  ><i class="fas fa-user-circle"></i
                ></span>
              </figure>
            </div>
            <div class="media-content" style="overflow: hidden">
              <p class="has-text-weight-semibold">{{ user!.firstName }}</p>
              <p class="has-text-grey is-size-7">@{{ user!.username }}</p>
              <div class="tags mt-1" style="gap: 0.25rem; margin-bottom: 0">
                <StatusTag :label="user!.role" variant="info" size="small" />
                <StatusTag
                  v-if="isMutual(user!.id)"
                  label="Mutual"
                  variant="success"
                  size="small"
                />
              </div>
            </div>
            <div class="media-right" @click.stop>
              <div class="is-flex is-align-items-center" style="gap: 0.5rem">
                <!-- Mutuals: no follow button, just the dropdown -->
                <template v-if="!isMutual(user!.id)">
                  <button
                    class="button is-info is-outlined is-small"
                    @click="toggleFollow(user!.id)"
                  >
                    <span class="icon is-small"><i class="fas fa-user-plus"></i></span>
                    <span>Follow back</span>
                  </button>
                </template>

                <!-- Dropdown -->
                <div class="dropdown" :class="{ 'is-active': openDropdownId === user!.id }">
                  <div class="dropdown-trigger">
                    <button class="button is-small is-light" @click.stop="toggleDropdown(user!.id)">
                      <span class="icon is-small"><i class="fas fa-ellipsis-v"></i></span>
                    </button>
                  </div>
                  <div class="dropdown-menu">
                    <div class="dropdown-content">
                      <a class="dropdown-item has-text-danger" @click="removeFollower(user!.id)">
                        <span class="icon is-small has-text-danger"
                          ><i class="fas fa-user-minus"></i
                        ></span>
                        Remove Follower
                      </a>
                      <a class="dropdown-item has-text-danger" @click="blockUser()">
                        <span class="icon is-small has-text-danger"
                          ><i class="fas fa-ban"></i
                        ></span>
                        Block
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── FIND PEOPLE TAB ───────────────────────────────────────── -->
        <template v-if="activeTab === 'find'">
          <div v-if="suggestedUsers.length === 0" class="has-text-centered py-6">
            <span class="icon is-large has-text-grey-light"
              ><i class="fas fa-user-slash fa-2x"></i
            ></span>
            <p class="has-text-grey mt-3">{{ emptyMessage }}</p>
          </div>

          <div
            v-for="user in suggestedUsers"
            :key="user.id"
            class="media user-row"
            style="cursor: pointer"
            @click="goToProfile(user.id)"
          >
            <div class="media-left">
              <figure class="image is-48x48">
                <img
                  v-if="user.image"
                  class="is-rounded avatar-img"
                  :src="user.image"
                  :alt="user.firstName"
                />
                <span v-else class="icon has-text-grey-light is-size-1"
                  ><i class="fas fa-user-circle"></i
                ></span>
              </figure>
            </div>
            <div class="media-content" style="overflow: hidden">
              <p class="has-text-weight-semibold">{{ user.firstName }}</p>
              <p class="has-text-grey is-size-7">@{{ user.username }}</p>
              <div class="tags mt-1" style="gap: 0.25rem; margin-bottom: 0">
                <StatusTag :label="user.role" variant="info" size="small" />
                <StatusTag
                  v-if="findTag(user.id)"
                  :label="findTag(user.id)!.label"
                  :variant="findTag(user.id)!.variant"
                  size="small"
                />
              </div>
            </div>
            <div class="media-right" @click.stop>
              <div class="is-flex is-align-items-center" style="gap: 0.5rem">
                <button
                  class="button is-small"
                  :class="isFollowing(user.id) ? 'is-info' : 'is-info is-outlined'"
                  @click="toggleFollow(user.id)"
                >
                  <span class="icon is-small">
                    <i :class="isFollowing(user.id) ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
                  </span>
                  <span>{{ isFollowing(user.id) ? 'Following' : 'Follow' }}</span>
                </button>

                <!-- Dropdown -->
                <div class="dropdown" :class="{ 'is-active': openDropdownId === user.id }">
                  <div class="dropdown-trigger">
                    <button class="button is-small is-light" @click.stop="toggleDropdown(user.id)">
                      <span class="icon is-small"><i class="fas fa-ellipsis-v"></i></span>
                    </button>
                  </div>
                  <div class="dropdown-menu">
                    <div class="dropdown-content">
                      <a class="dropdown-item" @click="goToProfile(user.id)">
                        <span class="icon is-small has-text-info"><i class="fas fa-user"></i></span>
                        View Profile
                      </a>
                      <a class="dropdown-item" @click="goToActivities(user.id)">
                        <span class="icon is-small has-text-primary"
                          ><i class="fas fa-running"></i
                        ></span>
                        See Activities
                      </a>
                      <hr class="dropdown-divider" />
                      <a class="dropdown-item" @click="toggleFollow(user.id)">
                        <span
                          class="icon is-small"
                          :class="isFollowing(user.id) ? 'has-text-danger' : 'has-text-success'"
                        >
                          <i
                            :class="isFollowing(user.id) ? 'fas fa-user-minus' : 'fas fa-user-plus'"
                          ></i>
                        </span>
                        {{ isFollowing(user.id) ? 'Unfollow' : 'Follow' }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ── FOOTER ─────────────────────────────────────────────────────── -->
      <footer class="modal-card-foot">
        <button class="button is-info is-outlined" @click="handleClose">
          <span class="icon"><i class="fas fa-times"></i></span>
          <span>Close</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.people-modal-card {
  width: min(620px, 96vw);
  max-height: 85vh;
}

/* Stack header items vertically */
.modal-head-col {
  flex-direction: column !important;
  align-items: stretch !important;
  padding-bottom: 0 !important;
  gap: 0 !important;
}

/* Tab strip bleeds to header edges */
.tab-strip {
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  margin-bottom: 0;
}

/* Active tab: info (light blue) background */
.tab-strip li.tab-active a {
  background-color: hsl(var(--bulma-info-h), var(--bulma-info-s), var(--bulma-info-l)) !important;
  color: #fff !important;
  border-bottom-color: transparent !important;
}

.tab-strip li.tab-active a .icon,
.tab-strip li.tab-active a .tab-count {
  color: #fff !important;
}

/* Plain-text count next to tab label */
.tab-count {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.85;
}

/* User rows */
.user-row {
  padding: 0.85rem 0;
  border-bottom: 1px solid hsl(0, 0%, 93%);
  align-items: center;
  margin-bottom: 0;
  transition: background-color 0.15s;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background-color: hsl(0, 0%, 98%);
}

/* Avatar */
.avatar-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
}

/* Clear search ✕ */
.clear-btn {
  pointer-events: all;
  cursor: pointer;
}

/* Dropdown pops out to the LEFT of the ⋮ button, vertically centred on it */
.dropdown-menu {
  min-width: 170px;
  top: 50%;
  left: auto;
  right: calc(100% + 0.5rem);
  transform: translateY(-50%);
  position: absolute;
}
</style>
