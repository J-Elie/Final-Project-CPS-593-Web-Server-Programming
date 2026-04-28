/**
 * usersStores.ts
 * ==============
 * This Pinia store manages the global state for users in the application.
 */

// ============================================================================
// IMPORTS
// ============================================================================
// Pinia's defineStore function to create a new store
import { defineStore } from 'pinia'
// TypeScript types
import type { User } from '../../../Server/Types/users.ts'
import type { DataListEnvelope } from '../../../Server/Types/dataEnvelopes.ts'
// Vue's ref function for creating reactive data
import { ref, watch } from 'vue'

import { api } from '../Services/myFetch'
import { useSessionStore } from './session'

// ============================================================================
// USERS STORE DEFINITION
// ============================================================================
export const useUsersStore = defineStore('users', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const users = ref<User[]>([])

  // GET /users is public — load immediately with full list
  api<DataListEnvelope<User>>('users?pageSize=1000').then((data) => {
    users.value = data.data
  })

  function sessionApi() {
    return useSessionStore().api
  }

  async function fetchUsers() {
    const data = await api<DataListEnvelope<User>>('users?pageSize=1000')
    users.value = data.data
  }

  // Re-fetch after login so following/followers arrays are populated from JWT
  watch(
    () => useSessionStore().token,
    (newToken) => {
      if (newToken) fetchUsers()
    },
  )

  // ============================================================================
  // ACTIONS
  // ============================================================================
  /**
   * addUser - Adds a new user to the store
   */
  async function addUser(userData: Omit<User, 'id'>) {
    const response = await sessionApi()<{ data: User }>('users', userData)
    const newUser = response.data
    users.value.push(newUser)
    return newUser
  }

  /**
   * updateUser - Updates an existing user in the store
   */
  async function updateUser(userId: number, userData: Partial<Omit<User, 'id'>>) {
    const response = await sessionApi()<{ data: User }>(`users/${userId}`, userData, { method: 'PATCH' })
    const updatedUser = response.data
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    return updatedUser
  }

  /**
   * deleteUser - Removes a user from the store
   */
  async function deleteUser(userId: number) {
    await sessionApi()(`users/${userId}`, undefined, { method: 'DELETE' })
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }

  /**
   * followUser - Follow a user and persist to the database
   */
  async function followUser(followerId: number, followingId: number) {
    await sessionApi()(`users/${followingId}/follow`, { followerId }, { method: 'POST' })
    const follower = users.value.find((u) => u.id === followerId)
    const following = users.value.find((u) => u.id === followingId)
    if (follower && !follower.following?.includes(followingId)) {
      follower.following = [...(follower.following ?? []), followingId]
    }
    if (following && !following.followers?.includes(followerId)) {
      following.followers = [...(following.followers ?? []), followerId]
    }
  }

  /**
   * unfollowUser - Unfollow a user and persist to the database
   */
  async function unfollowUser(followerId: number, followingId: number) {
    await sessionApi()(`users/${followingId}/follow`, { followerId }, { method: 'DELETE' })
    const follower = users.value.find((u) => u.id === followerId)
    const following = users.value.find((u) => u.id === followingId)
    if (follower) {
      follower.following = (follower.following ?? []).filter((id) => id !== followingId)
    }
    if (following) {
      following.followers = (following.followers ?? []).filter((id) => id !== followerId)
    }
  }

  /**
   * removeFollower - Remove a follower from your followers list (they stop following you)
   */
  async function removeFollower(userId: number, followerId: number) {
    await sessionApi()(`users/${userId}/followers/${followerId}`, undefined, { method: 'DELETE' })
    const user = users.value.find((u) => u.id === userId)
    const follower = users.value.find((u) => u.id === followerId)
    if (user) {
      user.followers = (user.followers ?? []).filter((id) => id !== followerId)
    }
    if (follower) {
      follower.following = (follower.following ?? []).filter((id) => id !== userId)
    }
  }

  /**
   * getUserById - Gets a user by ID
   */
  function getUserById(userId: number) {
    return users.value.find((u) => u.id === userId) || null
  }

  // ============================================================================
  // RETURN STORE PROPERTIES
  // ============================================================================
  return {
    users,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    followUser,
    unfollowUser,
    removeFollower,
    getUserById,
  }
})
