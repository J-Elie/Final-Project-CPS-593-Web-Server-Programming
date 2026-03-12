<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'
import type { User } from '@/types/users'
import EditButton from '@/components/buttons/EditButton.vue'
import DeleteButton from '@/components/buttons/DeleteButton.vue'
import AddButton from '@/components/buttons/AddButton.vue'
import StatusTag from '@/components/ui/StatusTag.vue'

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
// MODAL STATE
// ============================================================================
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingUserId = ref<number | null>(null)

// Form data for add/edit
const formData = reactive({
  firstName: '',
  username: '',
  image: '',
  role: 'user',
})

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================
function openAddModal() {
  // Reset form
  formData.firstName = ''
  formData.username = ''
  formData.image = ''
  formData.role = 'user'
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

function openEditModal(user: User) {
  editingUserId.value = user.id
  formData.firstName = user.firstName
  formData.username = user.username
  formData.image = user.image
  formData.role = user.role
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingUserId.value = null
}

// ============================================================================
// CRUD ACTIONS
// ============================================================================
function addUser() {
  if (!formData.firstName || !formData.username) {
    alert('Please fill in all required fields')
    return
  }

  usersStore.addUser({
    firstName: formData.firstName,
    username: formData.username,
    image: formData.image,
    role: formData.role,
    following: [],
    followers: [],
  })

  closeAddModal()
}

function updateUser() {
  if (!editingUserId.value) return

  if (!formData.firstName || !formData.username) {
    alert('Please fill in all required fields')
    return
  }

  usersStore.updateUser(editingUserId.value, {
    firstName: formData.firstName,
    username: formData.username,
    image: formData.image,
    role: formData.role,
  })

  closeEditModal()
}

function deleteUser(userId: number) {
  // Don't allow deleting yourself
  if (userId === authStore.currentUser?.id) {
    alert('You cannot delete yourself!')
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
            <span class="icon has-text-info mr-4">
              <i class="fas fa-users-cog"></i>
            </span>
            <span>User Management</span>
          </span>
        </h1>
        <p class="subtitle has-text-centered">Manage all registered users</p>

        <!-- Add User Button -->
        <div class="mb-4">
          <AddButton label="Add User" icon="fas fa-user-plus" @click="openAddModal" />
        </div>

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
                    <img
                      v-if="user.image"
                      class="is-rounded"
                      :src="user.image"
                      :alt="user.firstName"
                    />
                    <span v-else class="icon is-large has-text-grey">
                      <i class="fas fa-user-circle fa-3x"></i>
                    </span>
                  </figure>
                </td>
                <td>{{ user.firstName }}</td>
                <td>@{{ user.username }}</td>
                <td>
                  <StatusTag
                    :label="user.role"
                    :variant="user.role === 'admin' ? 'success' : 'info'"
                  />
                </td>
                <td>
                  <div class="buttons">
                    <EditButton small @click="openEditModal(user)" />
                    <DeleteButton
                      small
                      :disabled="user.id === authStore.currentUser?.id"
                      :title="
                        user.id === authStore.currentUser?.id
                          ? 'Cannot delete yourself'
                          : 'Delete user'
                      "
                      @click="deleteUser(user.id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div class="modal" :class="{ 'is-active': isAddModalOpen }">
      <div class="modal-background" @click="closeAddModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span class="icon"><i class="fas fa-user-plus"></i></span>
            Add New User
          </p>
          <button class="delete" aria-label="close" @click="closeAddModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Name *</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Enter name"
                v-model="formData.firstName"
              />
              <span class="icon is-small is-left"><i class="fas fa-user"></i></span>
            </div>
          </div>

          <div class="field">
            <label class="label">Username *</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Enter username"
                v-model="formData.username"
              />
              <span class="icon is-small is-left"><i class="fas fa-at"></i></span>
            </div>
          </div>

          <div class="field">
            <label class="label">Profile Image URL</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Enter image URL"
                v-model="formData.image"
              />
              <span class="icon is-small is-left"><i class="fas fa-image"></i></span>
            </div>
          </div>

          <div class="field">
            <label class="label">Role</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="formData.role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="addUser">
            <span class="icon"><i class="fas fa-check"></i></span>
            <span>Add User</span>
          </button>
          <button class="button" @click="closeAddModal">Cancel</button>
        </footer>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal" :class="{ 'is-active': isEditModalOpen }">
      <div class="modal-background" @click="closeEditModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span class="icon"><i class="fas fa-user-edit"></i></span>
            Edit User
          </p>
          <button class="delete" aria-label="close" @click="closeEditModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Name *</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Enter name"
                v-model="formData.firstName"
              />
              <span class="icon is-small is-left"><i class="fas fa-user"></i></span>
            </div>
          </div>

          <div class="field">
            <label class="label">Username *</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Enter username"
                v-model="formData.username"
              />
              <span class="icon is-small is-left"><i class="fas fa-at"></i></span>
            </div>
          </div>

          <div class="field">
            <label class="label">Profile Image URL</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="Enter image URL"
                v-model="formData.image"
              />
              <span class="icon is-small is-left"><i class="fas fa-image"></i></span>
            </div>
          </div>

          <div class="field">
            <label class="label">Role</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="formData.role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-info" @click="updateUser">
            <span class="icon"><i class="fas fa-save"></i></span>
            <span>Save Changes</span>
          </button>
          <button class="button" @click="closeEditModal">Cancel</button>
        </footer>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
