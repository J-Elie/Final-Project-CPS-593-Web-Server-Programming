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
  const nextId = ref(data.users.length + 1)

  // ============================================================================
  // ACTIONS
  // ============================================================================
  /**
   * addUser - Adds a new user to the store
   */
  function addUser(userData: Omit<User, 'id'>) {
    const newUser: User = {
      id: nextId.value++,
      ...userData,
    }
    users.value.push(newUser)
    return newUser
  }

  /**
   * updateUser - Updates an existing user in the store
   */
  function updateUser(userId: number, userData: Partial<Omit<User, 'id'>>) {
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userData } as User
      return users.value[index]
    }
    return null
  }

  /**
   * deleteUser - Removes a user from the store
   */
  function deleteUser(userId: number) {
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
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
  return { users, addUser, updateUser, deleteUser, getUserById }
})
