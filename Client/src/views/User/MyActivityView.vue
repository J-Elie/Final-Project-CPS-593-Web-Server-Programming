<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import type { Post } from '@/types/posts'
import PostCard from '@/components/PostCard.vue'

// ============================================================================
// STORE INITIALIZATION
// ============================================================================
const authStore = useAuthStore()
const postsStore = usePostsStore()

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
// Get only the current user's posts
const myPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

// Sort posts by date (newest first)
const sortedActivities = computed(() => {
  return [...myPosts.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

// ============================================================================
// MODAL STATE
// ============================================================================
// Track modal open/closed state
const isModalOpen = ref(false)

// Track if we're editing an existing activity
const editingActivityId = ref<number | null>(null)

// Activity form data
const activityForm = ref({
  title: '',
  type: '',
  date: '',
  duration: '',
  intensity: '',
  picture: '',
  notes: '',
})

// Available activity types (can be extended by user)
const activityTypes = ref([
  'Running',
  'Walking',
  'Cycling',
  'Swimming',
  'Weightlifting',
  'Yoga',
  'Other',
])

// For adding new activity type
const newActivityType = ref('')
const showAddType = ref(false)

// Intensity levels
const intensityLevels = ['Easy', 'Moderate', 'Hard', 'Extreme']

// Get today's date in YYYY-MM-DD format for date input max attribute
const today = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================
// Open the modal for adding new activity
function openModal() {
  editingActivityId.value = null
  isModalOpen.value = true
}

// Open the modal for editing an existing activity
function editActivity(activity: Post) {
  editingActivityId.value = activity.id
  activityForm.value = {
    title: activity.title,
    type: activity.type,
    date: activity.date,
    duration: activity.duration,
    intensity: activity.intensity,
    picture: activity.picture,
    notes: activity.notes,
  }
  isModalOpen.value = true
}

// Close the modal
function closeModal() {
  isModalOpen.value = false
  editingActivityId.value = null
  resetForm()
}

// Reset form data
function resetForm() {
  activityForm.value = {
    title: '',
    type: '',
    date: '',
    duration: '',
    intensity: '',
    picture: '',
    notes: '',
  }
  showAddType.value = false
  newActivityType.value = ''
}

// Add new activity type to the list
function addNewType() {
  if (newActivityType.value.trim()) {
    activityTypes.value.push(newActivityType.value.trim())
    activityForm.value.type = newActivityType.value.trim()
    newActivityType.value = ''
    showAddType.value = false
  }
}

// ============================================================================
// CRUD OPERATIONS (using store)
// ============================================================================
// Handle form submission (add or edit)
function submitActivity() {
  if (!authStore.currentUser) return

  if (editingActivityId.value !== null) {
    // Editing existing activity - use store
    postsStore.updatePost(editingActivityId.value, {
      title: activityForm.value.title,
      type: activityForm.value.type,
      date: activityForm.value.date,
      duration: activityForm.value.duration,
      intensity: activityForm.value.intensity,
      picture: activityForm.value.picture,
      notes: activityForm.value.notes,
    })
  } else {
    // Adding new activity - use store
    postsStore.addPost({
      userId: authStore.currentUser.id,
      title: activityForm.value.title,
      type: activityForm.value.type,
      date: activityForm.value.date,
      duration: activityForm.value.duration,
      intensity: activityForm.value.intensity,
      picture: activityForm.value.picture,
      notes: activityForm.value.notes,
    })
  }
  closeModal()
}

// Delete an activity - use store
function deleteActivity(id: number) {
  postsStore.deletePost(id)
}
</script>

<template>
  <main>
    <!-- Hero Section for Page Title -->
    <section class="hero is-info is-small mt-5 mb-5">
      <div class="hero-body has-text-centered">
        <p class="title">
          <span class="icon-text">
            <span class="icon mr-4">
              <i class="fas fa-heartbeat"></i>
            </span>
            <span>My Activities</span>
          </span>
        </p>
      </div>
    </section>

    <!-- Add Activity Button -->
    <div class="has-text-centered mb-5">
      <button class="button is-primary is-medium" @click="openModal">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span>Add Activity</span>
      </button>
    </div>

    <!-- Activity Feed -->
    <div class="columns is-centered">
      <div class="column is-three-quarters">
        <!-- Empty state -->
        <div v-if="sortedActivities.length === 0" class="notification is-light">
          <p class="has-text-centered">
            <span class="icon is-large">
              <i class="fas fa-running fa-2x"></i>
            </span>
          </p>
          <p class="has-text-centered">No activities yet. Start tracking your fitness journey!</p>
        </div>

        <!-- Activity Cards -->
        <PostCard
          v-for="activity in sortedActivities"
          :key="activity.id"
          :post="activity"
          :show-actions="true"
          @edit="editActivity"
          @delete="deleteActivity"
        />
      </div>
    </div>

    <!-- Add/Edit Activity Modal -->
    <div class="modal" :class="{ 'is-active': isModalOpen }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-content">
        <div class="box">
          <h2 class="title is-4">{{ editingActivityId ? 'Edit Activity' : 'Add New Activity' }}</h2>

          <!-- Activity Title -->
          <div class="field">
            <label class="label">Activity/Post Title</label>
            <div class="control has-icons-left">
              <input
                class="input"
                type="text"
                placeholder="e.g., Morning Run at SUNY New Paltz, Leg Day!"
                v-model="activityForm.title"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-heading"></i>
              </span>
            </div>
          </div>

          <!-- Activity Type -->
          <div class="field">
            <label class="label">Activity Type</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="activityForm.type">
                  <option value="" disabled>Select activity type</option>
                  <option v-for="type in activityTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
            </div>
            <p class="help">
              <a @click="showAddType = !showAddType">
                <span class="icon is-small"><i class="fas fa-plus"></i></span>
                Add custom type
              </a>
            </p>
            <!-- Add new type input -->
            <div class="field has-addons mt-2" v-if="showAddType">
              <div class="control is-expanded">
                <input
                  class="input is-small"
                  type="text"
                  placeholder="New activity type"
                  v-model="newActivityType"
                  @keyup.enter="addNewType"
                />
              </div>
              <div class="control">
                <button class="button is-small is-info" @click="addNewType">Add</button>
              </div>
            </div>
          </div>

          <!-- Date and Duration (side by side) -->
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">Date</label>
                <div class="control has-icons-left">
                  <input class="input" type="date" v-model="activityForm.date" :max="today" />
                  <span class="icon is-small is-left">
                    <i class="fas fa-calendar"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">Duration (minutes)</label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="number"
                    placeholder="30"
                    min="1"
                    v-model="activityForm.duration"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-clock"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Intensity -->
          <div class="field">
            <label class="label">Intensity</label>
            <div class="control">
              <div class="buttons has-addons">
                <button
                  v-for="level in intensityLevels"
                  :key="level"
                  class="button"
                  :class="{
                    'is-success': activityForm.intensity === level && level === 'Easy',
                    'is-warning': activityForm.intensity === level && level === 'Moderate',
                    'is-danger':
                      activityForm.intensity === level && (level === 'Hard' || level === 'Extreme'),
                    'is-selected': activityForm.intensity === level,
                  }"
                  @click="activityForm.intensity = level"
                  type="button"
                >
                  {{ level }}
                </button>
              </div>
            </div>
          </div>

          <!-- Picture URL (optional) -->
          <div class="field">
            <label class="label"
              >Picture URL <span class="has-text-grey-light">(optional)</span></label
            >
            <div class="control has-icons-left">
              <input
                class="input"
                type="url"
                placeholder="https://example.com/image.jpg"
                v-model="activityForm.picture"
              />
              <span class="icon is-small is-left">
                <i class="fas fa-image"></i>
              </span>
            </div>
            <!-- Preview image if URL is provided -->
            <figure class="image is-128x128 mt-2" v-if="activityForm.picture">
              <img :src="activityForm.picture" alt="Activity preview" />
            </figure>
          </div>

          <!-- Notes -->
          <div class="field">
            <label class="label">Notes <span class="has-text-grey-light">(optional)</span></label>
            <div class="control">
              <textarea
                class="textarea"
                placeholder="How did it go? Any achievements?"
                v-model="activityForm.notes"
              ></textarea>
            </div>
          </div>

          <!-- Submit and Cancel buttons -->
          <div class="field is-grouped">
            <div class="control">
              <button class="button is-link" @click="submitActivity">
                <span class="icon"><i class="fas fa-save"></i></span>
                <span>{{ editingActivityId ? 'Update Activity' : 'Save Activity' }}</span>
              </button>
            </div>
            <div class="control">
              <button class="button is-link is-light" @click="closeModal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeModal"></button>
    </div>
  </main>
</template>

<style scoped></style>
