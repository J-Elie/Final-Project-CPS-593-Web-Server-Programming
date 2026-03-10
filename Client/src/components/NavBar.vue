<!--
  NavBar.vue
  ==========
  This component renders the main navigation bar for the application.
  It uses Bulma CSS framework for styling and includes:
  - A responsive hamburger menu for mobile devices
  - Navigation links using Vue Router
  - A dropdown menu for additional pages
  - Authentication buttons (Register / Log in)
-->

<script setup lang="ts">
// ============================================================================
// IMPORTS
// ============================================================================
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/usersStores'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/users'

// ============================================================================
// STORE INITIALIZATION
// ============================================================================
// Get the users store instance for accessing user data
const usersStore = useUsersStore()
// Get the auth store instance for managing logged-in user
const authStore = useAuthStore()
// Get the router instance for navigation
const router = useRouter()

// ============================================================================
// THEME TOGGLE FUNCTIONALITY
// ============================================================================
// Reactive ref to track current theme state (true = dark mode)
const isDarkMode = ref(false)

// ============================================================================
// TEST USER SELECTION (for development/testing)
// ============================================================================
// Get users from the store (computed to stay reactive)
const testUsers = computed(() => usersStore.users)
// Get selected user from auth store (computed to stay reactive)
const selectedUser = computed(() => authStore.currentUser)
// Track if user dropdown is open (for click-based dropdown)
const isUserDropdownOpen = ref(false)

// Function to select a test user (login/logout)
function selectUser(user: User | null) {
  if (user) {
    authStore.login(user)
  } else {
    authStore.logout()
    router.push('/')
  }
  isUserDropdownOpen.value = false
}

// Toggle the user dropdown open/closed
function toggleUserDropdown() {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

// Function to toggle between light and dark themes
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  // Set the data-theme attribute on the document root element
  // Bulma uses this attribute to apply dark/light theme styles
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
}

// Initialize theme on component mount
onMounted(() => {
  // Check if user prefers dark mode via system settings
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode.value = prefersDark
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
})

// ============================================================================
// MOBILE HAMBURGER MENU FUNCTIONALITY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Get all "navbar-burger" elements
  const navbarBurgers: HTMLElement[] = Array.from(document.querySelectorAll('.navbar-burger'))
  // Loop through each burger element and attach a click event listener
  navbarBurgers.forEach((el) => {
    el.addEventListener('click', () => {
      // The "data-target" attribute on the burger contains the ID of the menu to toggle
      const target = el.dataset.target

      // Find the target menu element by its ID
      // We use a conditional check because:
      // 1. target might be undefined if data-target attribute is missing
      // 2. getElementById can return null if no element with that ID exists
      const targetElement = target ? document.getElementById(target) : null

      // Toggle the "is-active" class on the burger icon itself
      // This changes the hamburger icon animation (three lines become an X)
      // to indicate the menu is open and can be closed
      el.classList.toggle('is-active')

      // Toggle the "is-active" class on the navbar-menu
      // This shows or hides the menu on mobile devices
      // We use optional chaining (?.) to safely handle the case where targetElement is null
      // If targetElement is null, nothing happens (no error thrown)
      targetElement?.classList.toggle('is-active')
    })
  })
})
</script>

<template>
  <!--
    ============================================================================
    MAIN NAVIGATION BAR
    ============================================================================
  -->
  <nav class="navbar is-info" role="navigation" aria-label="main navigation">
    <div class="container">
      <!--
        ========================================================================
        NAVBAR BRAND SECTION
        ========================================================================
      -->
      <div class="navbar-brand">
        <!--
          LOGO / BRAND LINK
          =================
        -->
        <a class="navbar-item" href="/">
          <img alt="Vue logo" width="30" height="30" src="@/assets/logo.svg" />
        </a>

        <!--
          ======================================================================
          HAMBURGER MENU BUTTON (Mobile Only)
          ======================================================================
        -->
        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <!--
        ========================================================================
        NAVBAR MENU (Collapsible Section)
        ========================================================================
      -->
      <div id="navbarBasicExample" class="navbar-menu">
        <!--
          ======================================================================
          NAVBAR START (Left-aligned navigation items)
          ======================================================================
        -->
        <div class="navbar-start">
          <!--
            HOME LINK
            =========
          -->
          <RouterLink to="/" active-class="is-active" class="navbar-item"> Home </RouterLink>

          <!--
            ABOUT LINK
            ==========
          -->
          <RouterLink to="/about" active-class="is-active" class="navbar-item"> About </RouterLink>

          <!--
            MY ACTIVITY LINK (logged in only)
            ================
          -->
          <RouterLink v-if="selectedUser" to="/User/MyActivity" active-class="is-active" class="navbar-item">
            My Activity
          </RouterLink>
          <!--
            MY STATISTICS LINK (logged in only)
            =================
          -->
          <RouterLink v-if="selectedUser" to="/User/MyStatistics" active-class="is-active" class="navbar-item">
            My Statistics
          </RouterLink>
          <!--
            FRIENDS ACTIVITY LINK (logged in only)
            ====================
          -->
          <RouterLink v-if="selectedUser" to="/User/ActivityFeed" active-class="is-active" class="navbar-item">
            Activity Feed
          </RouterLink>

          <!--
            ====================================================================
            DROPDOWN MENU (Admin only)
            ====================================================================
          -->
          <div v-if="selectedUser?.role === 'admin'" class="navbar-item has-dropdown is-hoverable">
            <!--
              DROPDOWN TRIGGER
              ================
            -->
            <a class="navbar-link"> Admin </a>

            <!--
              NAVBAR DROPDOWN CONTENT
              =======================
            -->
            <div class="navbar-dropdown">
              <RouterLink to="/Admin/UserManagement" active-class="is-active" class="navbar-item">
                User Management
              </RouterLink>
              <RouterLink to="/Admin/FlaggedPosts" active-class="is-active" class="navbar-item">
                Flagged Posts
              </RouterLink>

              <!--
                DROPDOWN DIVIDER
                ================
              -->
              <hr class="navbar-divider" />

              <RouterLink to="/report-issue" active-class="is-active" class="navbar-item">
                Report an issue
              </RouterLink>
            </div>
          </div>
        </div>

        <!--
          ======================================================================
          NAVBAR RIGHT-ALIGNED ITEMS
          ======================================================================
        -->
        <div class="navbar-end">
          <div class="navbar-item">
            <!--
              BUTTON GROUP
              ============
            -->
            <div class="buttons">
              <!--
                REGISTER BUTTON (only visible when NOT signed in)
                ===============
              -->
              <RouterLink v-if="!selectedUser" to="/register" active-class="is-active" class="button is-primary">
                <strong>Register</strong>
              </RouterLink>

              <!--
                LOG IN BUTTON (only visible when NOT signed in)
                =============
              -->
              <RouterLink v-if="!selectedUser" to="/login" active-class="is-active" class="button is-light">
                <strong>Log in</strong>
              </RouterLink>

              <!--
                LOG OUT BUTTON (only visible when signed in)
                ==============
              -->
              <button v-if="selectedUser" class="button is-light" @click="selectUser(null)">
                <strong>Log out</strong>
              </button>
            </div>
          </div>
          <!--
            THEME TOGGLE BUTTON
            ===================
            Toggles between Bulma light and dark mode
          -->
          <div class="navbar-item">
            <button
              class="button"
              @click="toggleTheme"
              :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <span class="icon">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
              </span>
            </button>
          </div>

          <!--
            TEST USER DROPDOWN
            ==================
            For development/testing: quickly switch between test users
            Uses Bulma navbar dropdown styling with click-to-toggle behavior
          -->
          <div class="navbar-item has-dropdown" :class="{ 'is-active': isUserDropdownOpen }">
            <a class="navbar-link" @click="toggleUserDropdown">
              <figure v-if="selectedUser" class="image is-32x32 mr-2">
                <img class="is-rounded" :src="selectedUser.image" :alt="selectedUser.firstName" />
              </figure>
              <span v-else class="icon is-small"><i class="fas fa-user"></i></span>
              <span>{{ selectedUser?.firstName || 'Test User' }}</span>
            </a>

            <div class="navbar-dropdown is-right">
              <a
                v-for="user in testUsers"
                :key="user.id"
                class="navbar-item"
                :class="{ 'is-active': selectedUser?.id === user.id }"
                @click="selectUser(user)"
              >
                <figure class="image is-32x32 mr-2">
                  <img class="is-rounded" :src="user.image" :alt="user.firstName" />
                </figure>
                {{ user.firstName }}
              </a>
              <hr class="navbar-divider" v-if="selectedUser" />
              <a class="navbar-item" v-if="selectedUser" @click="selectUser(null)">
                <span class="icon is-small"><i class="fas fa-sign-out-alt"></i></span>
                <span>Log out</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<!--
  ============================================================================
  SCOPED STYLES
  ============================================================================
-->
<style scoped>
/* Bulma doesn't have utilities for inline images in navbar or image borders */
.navbar-link .image {
  display: inline-flex;
}

.navbar-link .image img,
.navbar-dropdown .navbar-item .image img {
  border: 2px solid white;
}

:root[data-theme='dark'] .navbar-link .image img,
:root[data-theme='dark'] .navbar-dropdown .navbar-item .image img {
  border-color: black;
}
</style>
