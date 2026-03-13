<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'
import UserCard from '@/components/UserCard.vue'

// ============================================================================
// STORES
// ============================================================================
const authStore = useAuthStore()
const usersStore = useUsersStore()

// ============================================================================
// SEARCH
// ============================================================================
const searchQuery = ref('')

// ============================================================================
// RANKED SUGGESTIONS
// ============================================================================
// Priority:
// 1. Users who follow you back (mutual)
// 2. Followers of people you follow (friends of friends)
// 3. Everyone else
// Always exclude yourself and people you already follow

const suggestions = computed(() => {
  if (!authStore.currentUser) return []

  const me = authStore.currentUser
  const myId = me.id
  const myFollowing = new Set(me.following ?? [])
  const myFollowers = new Set(me.followers ?? [])

  // Friends of friends: people followed by people I follow
  const friendsOfFriends = new Set<number>()
  usersStore.users
    .filter((u) => myFollowing.has(u.id))
    .forEach((u) => {
      ;(u.following ?? []).forEach((id) => {
        if (id !== myId && !myFollowing.has(id)) {
          friendsOfFriends.add(id)
        }
      })
    })

  return usersStore.users
    .filter((u) => u.id !== myId && !myFollowing.has(u.id))
    .map((u) => {
      let priority = 3
      if (myFollowers.has(u.id))
        priority = 1 // follows you
      else if (friendsOfFriends.has(u.id)) priority = 2 // friend of friend
      return { user: u, priority }
    })
    .sort((a, b) => a.priority - b.priority)
    .map((x) => x.user)
})

// ============================================================================
// FILTERED (search applied on top of suggestions)
// ============================================================================
const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return suggestions.value
  return usersStore.users.filter(
    (u) =>
      u.id !== authStore.currentUser?.id &&
      (u.firstName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)),
  )
})

const isSearching = computed(() => searchQuery.value.trim().length > 0)
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Page Header -->
      <h1 class="title is-2 has-text-centered">
        <span class="icon-text is-justify-content-center">
          <span class="icon has-text-info mr-4">
            <i class="fas fa-compass"></i>
          </span>
          <span>Discover People</span>
        </span>
      </h1>
      <p class="subtitle has-text-centered">Find and connect with other fitness enthusiasts</p>

      <div class="columns is-centered">
        <div class="column is-three-quarters">
          <!-- Search Bar -->
          <div class="box mb-5">
            <div class="field">
              <div class="control has-icons-left has-icons-right">
                <input
                  class="input is-medium"
                  type="text"
                  placeholder="Search by name or username…"
                  v-model="searchQuery"
                />
                <span class="icon is-left"><i class="fas fa-search"></i></span>
                <span
                  v-if="searchQuery"
                  class="icon is-right"
                  style="pointer-events: all; cursor: pointer"
                  @click="searchQuery = ''"
                >
                  <i class="fas fa-times"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- Search Results -->
          <template v-if="isSearching">
            <p class="heading has-text-grey mb-3">
              <span class="icon"><i class="fas fa-search"></i></span>
              Search results for "{{ searchQuery }}"
            </p>
            <div v-if="filteredUsers.length === 0" class="notification is-light has-text-centered">
              <span class="icon"><i class="fas fa-user-slash"></i></span>
              No users found matching "{{ searchQuery }}"
            </div>
            <UserCard v-for="user in filteredUsers" :key="user.id" :user="user" />
          </template>

          <!-- Ranked Suggestions -->
          <template v-else>
            <!-- People who follow you -->
            <template
              v-if="
                suggestions.filter((u) => authStore.currentUser?.followers?.includes(u.id)).length
              "
            >
              <p class="heading has-text-grey mb-3">
                <span class="icon has-text-success"><i class="fas fa-user-check"></i></span>
                They follow you
              </p>
              <UserCard
                v-for="user in suggestions.filter((u) =>
                  authStore.currentUser?.followers?.includes(u.id),
                )"
                :key="user.id"
                :user="user"
              />
              <hr />
            </template>

            <!-- Friends of friends -->
            <template
              v-if="
                suggestions.filter((u) => !authStore.currentUser?.followers?.includes(u.id)).length
              "
            >
              <p class="heading has-text-grey mb-3 mt-4">
                <span class="icon has-text-info"><i class="fas fa-user-friends"></i></span>
                You might know
              </p>
              <UserCard
                v-for="user in suggestions.filter(
                  (u) => !authStore.currentUser?.followers?.includes(u.id),
                )"
                :key="user.id"
                :user="user"
              />
            </template>

            <!-- No suggestions -->
            <div v-if="suggestions.length === 0" class="notification is-light has-text-centered">
              <span class="icon is-large"><i class="fas fa-users fa-2x"></i></span>
              <p class="mt-3">No suggestions right now. Try searching for someone!</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
