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
import { ref } from 'vue'

import { api } from '../Services/myFetch'

// ============================================================================
// USERS STORE DEFINITION
// ============================================================================
export const useUsersStore = defineStore('users', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const users = ref<User[]>([])

  api<DataListEnvelope<User>>('users').then((data) => {
    users.value = data.data
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================
  /**
   * addUser - Adds a new user to the store
   */
  async function addUser(userData: Omit<User, 'id'>) {
    const response = await api<{ data: User }>('users', userData)
    const newUser = response.data
    users.value.push(newUser)
    return newUser
  }

  /**
   * updateUser - Updates an existing user in the store
   */
  async function updateUser(userId: number, userData: Partial<Omit<User, 'id'>>) {
    const response = await api<{ data: User }>(`users/${userId}`, userData, { method: 'PATCH' })
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
    await api(`users/${userId}`, undefined, { method: 'DELETE' })
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }

  /**
   * followUser - Follow a user and persist to the database
   */
  async function followUser(followerId: number, followingId: number) {
    await api(`users/${followingId}/follow`, { followerId }, { method: 'POST' })
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
    await api(`users/${followingId}/follow`, { followerId }, { method: 'DELETE' })
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
    await api(`users/${userId}/followers/${followerId}`, undefined, { method: 'DELETE' })
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
    addUser,
    updateUser,
    deleteUser,
    followUser,
    unfollowUser,
    removeFollower,
    getUserById,
  }
})
