<script setup lang="ts">
/**
 * FindPeopleModal.vue
 * ===================
 * Modal for discovering and following new users.
 * Same look and feel as UserListModal but shows suggested / searchable users
 * that the current user is NOT already following.
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'
import { useRouter } from 'vue-router'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const usersStore = useUsersStore()
const router = useRouter()

// ============================================================================
// RANKED SUGGESTIONS (same logic as DiscoverPeopleView)
// Priority 1: they follow you | 2: friends of friends | 3: everyone else
// ============================================================================
const ranked = computed(() => {
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
})

// ============================================================================
// SEARCH
// ============================================================================
const searchQuery = ref('')

const displayedUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return ranked.value
  // Search includes people already followed when actively searching
  return usersStore.users.filter(
    (u) =>
      u.id !== authStore.currentUser?.id &&
      (u.firstName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)),
  )
})

const isSearching = computed(() => searchQuery.value.trim().length > 0)

// ============================================================================
// DROPDOWN
// ============================================================================
const openDropdownId = ref<number | null>(null)

function toggleDropdown(id: number) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function closeDropdown() {
  openDropdownId.value = null
}

// ============================================================================
// ACTIONS
// ============================================================================
function isFollowing(userId: number): boolean {
  return authStore.currentUser?.following?.includes(userId) ?? false
}

function toggleFollow(userId: number) {
  if (!authStore.currentUser) return
  const following = [...(authStore.currentUser.following ?? [])]
  const idx = following.indexOf(userId)
  if (idx === -1) {
    following.push(userId)
  } else {
    following.splice(idx, 1)
  }
  authStore.currentUser = { ...authStore.currentUser, following }
  closeDropdown()
}

function viewProfile(userId: number) {
  router.push(`/User/Profile/${userId}`)
  handleClose()
}

function viewActivities(userId: number) {
  router.push(`/User/Activities/${userId}`)
  handleClose()
}

function handleClose() {
  searchQuery.value = ''
  closeDropdown()
  emit('close')
}

// ============================================================================
// SECTION LABELS
// ============================================================================
function labelFor(userId: number): { text: string; colour: string } | null {
  if (isSearching.value) return null
  const me = authStore.currentUser
  if (!me) return null
  if (me.followers?.includes(userId)) return { text: 'Follows you', colour: 'is-success' }
  const myFollowing = new Set(me.following ?? [])
  const isFoF = usersStore.users
    .filter((u) => myFollowing.has(u.id))
    .some((u) => u.following?.includes(userId))
  if (isFoF) return { text: 'Mutual friend', colour: 'is-info is-light' }
  return null
}
</script>

<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="handleClose"></div>
    <div class="modal-card">
      <!-- Header -->
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span class="icon has-text-info"><i class="fas fa-compass"></i></span>
          Find People
        </p>
        <button class="delete" aria-label="close" @click="handleClose"></button>
      </header>

      <!-- Body -->
      <section class="modal-card-body">
        <!-- Search -->
        <div class="field mb-4">
          <div class="control has-icons-left has-icons-right">
            <input
              class="input"
              type="text"
              placeholder="Search by name or username…"
              v-model="searchQuery"
            />
            <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
            <span
              v-if="searchQuery"
              class="icon is-small is-right clear-icon"
              @click="searchQuery = ''"
            >
              <i class="fas fa-times"></i>
            </span>
          </div>
        </div>

        <!-- Section label -->
        <p v-if="!isSearching && displayedUsers.length" class="heading has-text-grey mb-3">
          <span class="icon"><i class="fas fa-star"></i></span>
          Suggested for you
        </p>
        <p v-if="isSearching && displayedUsers.length" class="heading has-text-grey mb-3">
          <span class="icon"><i class="fas fa-search"></i></span>
          Results for "{{ searchQuery }}"
        </p>

        <!-- Empty state -->
        <div v-if="displayedUsers.length === 0" class="has-text-centered py-5">
          <span class="icon is-large has-text-grey-light">
            <i class="fas fa-user-slash fa-2x"></i>
          </span>
          <p class="has-text-grey mt-3">
            {{ isSearching ? `No results for "${searchQuery}"` : 'No suggestions right now.' }}
          </p>
        </div>

        <!-- User list -->
        <div
          v-for="user in displayedUsers"
          :key="user.id"
          class="media user-row"
          @click.self="closeDropdown"
        >
          <!-- Avatar -->
          <div class="media-left">
            <figure class="image is-48x48">
              <img v-if="user.image" class="is-rounded" :src="user.image" :alt="user.firstName" />
              <span v-else class="icon has-text-grey-light" style="font-size: 3rem">
                <i class="fas fa-user-circle"></i>
              </span>
            </figure>
          </div>

          <!-- Info -->
          <div class="media-content">
            <p class="has-text-weight-semibold">{{ user.firstName }}</p>
            <p class="has-text-grey is-size-7">@{{ user.username }}</p>
            <div class="tags mt-1" style="gap: 0.25rem">
              <span class="tag is-info is-rounded is-small">{{ user.role }}</span>
              <span
                v-if="labelFor(user.id)"
                class="tag is-rounded is-small"
                :class="labelFor(user.id)!.colour"
              >
                {{ labelFor(user.id)!.text }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="media-right">
            <div class="is-flex is-align-items-center" style="gap: 0.5rem">
              <!-- Follow / Unfollow -->
              <button
                class="button is-small"
                :class="isFollowing(user.id) ? 'is-info' : 'is-info is-outlined'"
                @click="toggleFollow(user.id)"
              >
                <span class="icon">
                  <i :class="isFollowing(user.id) ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
                </span>
                <span>{{ isFollowing(user.id) ? 'Following' : 'Follow' }}</span>
              </button>

              <!-- Dropdown -->
              <div class="dropdown" :class="{ 'is-active': openDropdownId === user.id }">
                <div class="dropdown-trigger">
                  <button class="button is-small is-light" @click.stop="toggleDropdown(user.id)">
                    <span class="icon"><i class="fas fa-ellipsis-v"></i></span>
                  </button>
                </div>
                <div class="dropdown-menu" style="right: 0; left: auto; min-width: 160px">
                  <div class="dropdown-content">
                    <a class="dropdown-item" @click="viewProfile(user.id)">
                      <span class="icon is-small"><i class="fas fa-user"></i></span>
                      View Profile
                    </a>
                    <a class="dropdown-item" @click="viewActivities(user.id)">
                      <span class="icon is-small"><i class="fas fa-running"></i></span>
                      See Activities
                    </a>
                    <hr class="dropdown-divider" />
                    <a class="dropdown-item" @click="toggleFollow(user.id)">
                      <span class="icon is-small">
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
      </section>

      <!-- Footer -->
      <footer class="modal-card-foot">
        <button class="button is-info is-outlined" @click="handleClose">Close</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.user-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid hsl(0, 0%, 93%);
  align-items: center;
}
.user-row:last-child {
  border-bottom: none;
}
.clear-icon {
  pointer-events: all;
  cursor: pointer;
}
.dropdown-menu {
  position: absolute;
}
</style>
