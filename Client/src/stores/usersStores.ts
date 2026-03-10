/**
 * usersStores.ts
 * ==============
 * This Pinia store manages the global state for users in the application.
 */

// ============================================================================
// IMPORTS
// ============================================================================
// Import user data from local JSON file
import data from '../data/users.json'
// Pinia's defineStore function to create a new store
import { defineStore } from 'pinia'
// TypeScript type for User objects (ensures type safety)
import type { User } from '../types/users.ts'
// Vue's ref function for creating reactive data
import { ref } from 'vue'

// ============================================================================
// USERS STORE DEFINITION
// ============================================================================
export const useUsersStore = defineStore('users', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const users = ref<User[]>(data.users)

  // ============================================================================
  // ACTIONS
  // ============================================================================
  /**
   * deleteUser - Removes a user from the store
   */
  function deleteUser(userId: number) {
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }

  // ============================================================================
  // RETURN STORE PROPERTIES
  // ============================================================================
  return { users, deleteUser }
})
