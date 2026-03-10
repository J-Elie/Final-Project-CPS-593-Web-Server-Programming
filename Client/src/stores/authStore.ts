/**
 * authStore.ts
 * ============
 * This Pinia store manages the current logged-in user state.
 * It provides:
 * - The currently selected/logged-in user
 * - Login and logout functionality
 * - Access to user info across all components
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { defineStore } from 'pinia'
import type { User } from '../types/users'
import { ref, computed } from 'vue'

// ============================================================================
// AUTH STORE DEFINITION
// ============================================================================
/**
 * useAuthStore
 * ------------
 * A Pinia store that manages the current user's authentication state.
 *
 * Usage in components:
 *   import { useAuthStore } from '@/stores/authStore'
 *   const authStore = useAuthStore()
 *   authStore.currentUser  // get logged-in user
 *   authStore.login(user)  // log in a user
 *   authStore.logout()     // log out
 */
export const useAuthStore = defineStore('auth', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  /**
   * currentUser - The currently logged-in user (null if not logged in)
   */
  const currentUser = ref<User | null>(null)

  // ============================================================================
  // GETTERS
  // ============================================================================
  /**
   * isLoggedIn - Returns true if a user is logged in
   */
  const isLoggedIn = computed(() => currentUser.value !== null)

  /**
   * isAdmin - Returns true if the logged-in user is an admin
   */
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  /**
   * userId - Returns the current user's ID (or null if not logged in)
   */
  const userId = computed(() => currentUser.value?.id ?? null)

  // ============================================================================
  // ACTIONS
  // ============================================================================
  /**
   * login - Sets the current user (simulates login)
   */
  function login(user: User) {
    currentUser.value = user
  }

  /**
   * logout - Clears the current user (simulates logout)
   */
  function logout() {
    currentUser.value = null
  }

  // ============================================================================
  // RETURN STORE PROPERTIES
  // ============================================================================
  return {
    // State
    currentUser,
    // Getters
    isLoggedIn,
    isAdmin,
    userId,
    // Actions
    login,
    logout
  }
})
