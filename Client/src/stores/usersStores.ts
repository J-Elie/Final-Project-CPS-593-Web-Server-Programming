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
  function addUser(userData: Omit<User, 'id'>) {
    const newUser: User = {
      id: users.value.length + 1,
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
