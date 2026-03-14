<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUsersStore } from '@/stores/usersStores'
import type { User } from '@/types/users'
import AddButton from '@/components/ui/buttons/AddButton.vue'
import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import EditProfileForm from '@/components/EditProfileForm.vue'

// ============================================================================
// STORE & ROUTER INITIALIZATION
// ============================================================================
const authStore = useAuthStore()
const usersStore = useUsersStore()
const router = useRouter()

// ============================================================================
// ACCESS CONTROL
// ============================================================================
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
const editingUser = ref<User | null>(null)

// ============================================================================
// ADD MODAL
// ============================================================================
// Blank user shell for the add form
const blankUser: User = {
  id: -1,
  firstName: '',
  username: '',
  image: '',
  role: 'user',
  bio: '',
  following: [],
  followers: [],
}

const addUserShell = ref<User>({ ...blankUser })

function openAddModal() {
  addUserShell.value = { ...blankUser }
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

function handleAddSubmit(formData: {
  firstName: string
  username: string
  image: string
  role: string
}) {
  usersStore.addUser({
    firstName: formData.firstName,
    username: formData.username,
    image: formData.image,
    role: formData.role,
    bio: '',
    following: [],
    followers: [],
  })
  closeAddModal()
}

// ============================================================================
// EDIT MODAL
// ============================================================================
function openEditModal(user: User) {
  editingUser.value = user
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingUser.value = null
}

function handleEditSubmit(formData: {
  firstName: string
  username: string
  image: string
  role: string
}) {
  if (!editingUser.value) return
  usersStore.updateUser(editingUser.value.id, formData)
  closeEditModal()
}

// ============================================================================
// DELETE
// ============================================================================
function deleteUser(userId: number) {
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
      <!-- Access Denied -->
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
                    <button
                      class="button is-info is-outlined is-small"
                      @click="openEditModal(user)"
                    >
                      <span class="icon"><i class="fas fa-edit"></i></span>
                      <span>Edit</span>
                    </button>
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
      <div class="modal-content">
        <EditProfileForm
          :user="addUserShell"
          :show-role="true"
          @submit="handleAddSubmit"
          @cancel="closeAddModal"
        />
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeAddModal"></button>
    </div>

    <!-- Edit User Modal -->
    <div class="modal" :class="{ 'is-active': isEditModalOpen }">
      <div class="modal-background" @click="closeEditModal"></div>
      <div class="modal-content">
        <EditProfileForm
          v-if="editingUser"
          :user="editingUser"
          :show-role="true"
          @submit="handleEditSubmit"
          @cancel="closeEditModal"
        />
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeEditModal"></button>
    </div>
  </main>
</template>

<style scoped></style>
