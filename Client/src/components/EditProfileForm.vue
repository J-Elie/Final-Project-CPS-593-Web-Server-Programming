<script setup lang="ts">
/**
 * EditProfileForm.vue
 * ===================
 * Reusable profile edit form. Used on both the Profile page and Admin panel.
 * Emits 'submit' with the form data and 'cancel' to close.
 */

import { reactive, watch } from 'vue'
import type { User } from '../../../Server/Types/users'
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
      lastName: string
      age: number
      gender: string
      email: string
      username: string
      image: string
      height: number
      weight: number
      role: string
      bio: string
    },
  ]
  cancel: []
}>()

const formData = reactive({
  firstName: props.user.firstName,
  lastName: props.user.lastName,
  age: props.user.age,
  gender: props.user.gender,
  email: props.user.email,
  username: props.user.username,
  image: props.user.image ?? '',
  height: props.user.height,
  weight: props.user.weight,
  role: props.user.role,
  bio: props.user.bio ?? '',
})

// Keep form in sync if the user prop changes
watch(
  () => props.user,
  (u) => {
    formData.firstName = u.firstName
    formData.lastName = u.lastName
    formData.age = u.age
    formData.gender = u.gender
    formData.email = u.email
    formData.username = u.username
    formData.image = u.image ?? ''
    formData.height = u.height
    formData.weight = u.weight
    formData.role = u.role
    formData.bio = u.bio ?? ''
  },
)

function handleSubmit() {
  if (!formData.firstName.trim() || !formData.username.trim() || !formData.email.trim()) {
    alert('First name, username, and email are required.')
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
      <label class="label">First Name *</label>
      <div class="control has-icons-left">
        <input
          class="input"
          type="text"
          placeholder="Enter first name"
          v-model="formData.firstName"
        />
        <span class="icon is-small is-left"><i class="fas fa-user"></i></span>
      </div>
    </div>

    <!-- Last Name -->
    <div class="field">
      <label class="label">Last Name</label>
      <div class="control has-icons-left">
        <input
          class="input"
          type="text"
          placeholder="Enter last name"
          v-model="formData.lastName"
        />
        <span class="icon is-small is-left"><i class="fas fa-user"></i></span>
      </div>
    </div>

    <!-- Email -->
    <div class="field">
      <label class="label">Email *</label>
      <div class="control has-icons-left">
        <input class="input" type="email" placeholder="Enter email" v-model="formData.email" />
        <span class="icon is-small is-left"><i class="fas fa-envelope"></i></span>
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

    <!-- Age -->
    <div class="field">
      <label class="label">Age</label>
      <div class="control has-icons-left">
        <input
          class="input"
          type="number"
          placeholder="Enter age"
          v-model.number="formData.age"
          min="0"
        />
        <span class="icon is-small is-left"><i class="fas fa-birthday-cake"></i></span>
      </div>
    </div>

    <!-- Gender -->
    <div class="field">
      <label class="label">Gender</label>
      <div class="control">
        <div class="select is-fullwidth">
          <select v-model="formData.gender">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Height / Weight -->
    <div class="field is-grouped">
      <div class="control is-expanded">
        <label class="label">Height (cm)</label>
        <div class="control has-icons-left">
          <input
            class="input"
            type="number"
            placeholder="cm"
            v-model.number="formData.height"
            min="0"
          />
          <span class="icon is-small is-left"><i class="fas fa-ruler-vertical"></i></span>
        </div>
      </div>
      <div class="control is-expanded">
        <label class="label">Weight (kg)</label>
        <div class="control has-icons-left">
          <input
            class="input"
            type="number"
            placeholder="kg"
            v-model.number="formData.weight"
            min="0"
          />
          <span class="icon is-small is-left"><i class="fas fa-weight"></i></span>
        </div>
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
