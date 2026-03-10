<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'

// ============================================================================
// STORE & ROUTER INITIALIZATION
// ============================================================================
const authStore = useAuthStore()
const usersStore = useUsersStore()
const router = useRouter()

// ============================================================================
// ACCESS CONTROL
// ============================================================================
// Redirect non-admin users to home on mount
onMounted(() => {
  if (!authStore.isLoggedIn || !authStore.isAdmin) {
    router.push('/')
  }
})

// ============================================================================
// ACTIONS
// ============================================================================
function deleteUser(userId: number) {
  // Don't allow deleting yourself
  if (userId === authStore.currentUser?.id) {
    alert("You cannot delete yourself!")
    return
  }

  if (confirm('Are you sure you want to delete this user?')) {
    usersStore.deleteUser(userId)
  }
}
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Access Denied (shown briefly before redirect) -->
      <div v-if="!authStore.isLoggedIn || !authStore.isAdmin" class="notification is-danger">
        <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
        Access denied. Admin privileges required.
      </div>

      <!-- Admin Content -->
      <div v-else>
        <!-- Page Header -->
        <h1 class="title is-2 has-text-centered">
          <span class="icon-text is-justify-content-center">
            <span class="icon has-text-warning mr-4">
              <i class="fas fa-users-cog"></i>
            </span>
            <span>User Management</span>
          </span>
        </h1>
        <p class="subtitle has-text-centered">Manage all registered users</p>

        <!-- Users Table -->
        <div class="box">
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>Profile Picture</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersStore.users" :key="user.id">
                <td>
                  <figure class="image is-48x48">
                    <img class="is-rounded" :src="user.image" :alt="user.firstName" />
                  </figure>
                </td>
                <td>{{ user.firstName }}</td>
                <td>@{{ user.username }}</td>
                <td>
                  <span class="tag" :class="user.role === 'admin' ? 'is-warning' : 'is-info'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <button
                    class="button is-danger is-small"
                    @click="deleteUser(user.id)"
                    :disabled="user.id === authStore.currentUser?.id"
                    :title="user.id === authStore.currentUser?.id ? 'Cannot delete yourself' : 'Delete user'"
                  >
                    <span class="icon">
                      <i class="fas fa-trash"></i>
                    </span>
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
