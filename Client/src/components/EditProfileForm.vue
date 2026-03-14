<script setup lang="ts">
/**
 * EditProfileForm.vue
 * ===================
 * Reusable profile edit form. Used on both the Profile page and Admin panel.
 * Emits 'submit' with the form data and 'cancel' to close.
 */

import { reactive, watch } from 'vue'
import type { User } from '@/types/users'
import AddButton from '@/components/ui/buttons/AddButton.vue'
import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'

const props = defineProps<{
  user: User
  showRole?: boolean // only true for admins
}>()

const emit = defineEmits<{
  submit: [
    data: {
      firstName: string
      username: string
      image: string
      role: string
      bio: string
    },
  ]
  cancel: []
}>()

const formData = reactive({
  firstName: props.user.firstName,
  username: props.user.username,
  image: props.user.image ?? '',
  role: props.user.role,
  bio: props.user.bio ?? '',
})

// Keep form in sync if the user prop changes
watch(
  () => props.user,
  (u) => {
    formData.firstName = u.firstName
    formData.username = u.username
    formData.image = u.image ?? ''
    formData.role = u.role
    formData.bio = u.bio ?? ''
  },
)

function handleSubmit() {
  if (!formData.firstName.trim() || !formData.username.trim()) {
    alert('Name and username are required.')
    return
  }
  emit('submit', { ...formData })
}
</script>

<template>
  <div class="box">
    <p class="title is-5 mb-4">
      <span class="icon has-text-info"><i class="fas fa-user-edit"></i></span>
      Edit Profile
    </p>

    <!-- Name -->
    <div class="field">
      <label class="label">Name *</label>
      <div class="control has-icons-left">
        <input class="input" type="text" placeholder="Enter name" v-model="formData.firstName" />
        <span class="icon is-small is-left"><i class="fas fa-user"></i></span>
      </div>
    </div>

    <!-- Username -->
    <div class="field">
      <label class="label">Username *</label>
      <div class="control has-icons-left">
        <input class="input" type="text" placeholder="Enter username" v-model="formData.username" />
        <span class="icon is-small is-left"><i class="fas fa-at"></i></span>
      </div>
    </div>

    <!-- Profile Image URL -->
    <div class="field">
      <label class="label">Profile Image URL</label>
      <div class="control has-icons-left">
        <input class="input" type="text" placeholder="Enter image URL" v-model="formData.image" />
        <span class="icon is-small is-left"><i class="fas fa-image"></i></span>
      </div>
    </div>

    <!-- Bio -->
    <div class="field">
      <label class="label">About Me</label>
      <div class="control">
        <textarea
          class="textarea"
          placeholder="Tell people a little about yourself…"
          v-model="formData.bio"
          rows="3"
        ></textarea>
      </div>
    </div>

    <!-- Role (admin only) -->
    <div v-if="showRole" class="field">
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

    <!-- Actions -->
    <div class="field is-grouped mt-5">
      <div class="control">
        <AddButton label="Save" icon="fas fa-save" @click="handleSubmit" />
      </div>
      <div class="control">
        <DeleteButton label="Cancel" :show-icon="false" @click="emit('cancel')" />
      </div>
    </div>
  </div>
</template>
