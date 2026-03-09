<script setup lang="ts">
import { ref, computed } from 'vue'

// Activity type definition
interface Activity {
  id: number
  title: string
  type: string
  date: string
  duration: string
  intensity: string
  picture: string
  notes: string
  createdAt: Date
}

// Track modal open/closed state
const isModalOpen = ref(false)

// Track if we're editing an existing activity
const editingActivityId = ref<number | null>(null)

// Counter for generating unique IDs
let nextId = 1

// Array to store all activities
const activities = ref<Activity[]>([])

// Activity form data
const activityForm = ref({
  title: '',
  type: '',
  date: '',
  duration: '',
  intensity: '',
  picture: '',
  notes: ''
})

// Available activity types (can be extended by user)
const activityTypes = ref([
  'Running',
  'Walking',
  'Cycling',
  'Swimming',
  'Weightlifting',
  'Yoga',
  'Other'
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

// Open the modal for adding new activity
function openModal() {
  editingActivityId.value = null
  isModalOpen.value = true
}

// Open the modal for editing an existing activity
function editActivity(activity: Activity) {
  editingActivityId.value = activity.id
  activityForm.value = {
    title: activity.title,
    type: activity.type,
    date: activity.date,
    duration: activity.duration,
    intensity: activity.intensity,
    picture: activity.picture,
    notes: activity.notes
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
    notes: ''
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

// Handle form submission (add or edit)
function submitActivity() {
  if (editingActivityId.value !== null) {
    // Editing existing activity
    const index = activities.value.findIndex((a) => a.id === editingActivityId.value)
    if (index !== -1) {
      const existingActivity = activities.value[index]!
      activities.value[index] = {
        id: existingActivity.id,
        createdAt: existingActivity.createdAt,
        title: activityForm.value.title,
        type: activityForm.value.type,
        date: activityForm.value.date,
        duration: activityForm.value.duration,
        intensity: activityForm.value.intensity,
        picture: activityForm.value.picture,
        notes: activityForm.value.notes
      }
    }
  } else {
    // Adding new activity
    const newActivity: Activity = {
      id: nextId++,
      title: activityForm.value.title,
      type: activityForm.value.type,
      date: activityForm.value.date,
      duration: activityForm.value.duration,
      intensity: activityForm.value.intensity,
      picture: activityForm.value.picture,
      notes: activityForm.value.notes,
      createdAt: new Date()
    }
    activities.value.push(newActivity)
  }
  closeModal()
}

// Computed property to sort activities by date (newest first)
const sortedActivities = computed(() => {
  return [...activities.value].sort((a, b) => {
    // Sort by date descending (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

// Delete an activity
function deleteActivity(id: number) {
  activities.value = activities.value.filter(a => a.id !== id)
}

// Format date for display
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get intensity color class
function getIntensityClass(intensity: string): string {
  switch (intensity) {
    case 'Easy': return 'is-success'
    case 'Moderate': return 'is-warning'
    case 'Hard': return 'is-danger'
    case 'Extreme': return 'is-danger'
    default: return 'is-info'
  }
}
</script>

<template>
  <main>
    <!-- Hero Section for Page Title -->
    <section class="hero is-info is-small mt-5 mb-5">
      <div class="hero-body has-text-centered">
        <p class="title">
          <span class="icon-text">
            <span class="icon">
              <i class="fas fa-heartbeat"></i>
            </span>
            <span>My Activities</span>
          </span>
        </p>
        <p class="subtitle">My fitness journey</p>
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
      <div class="card mb-4" v-for="activity in sortedActivities" :key="activity.id">
        <!-- Card Image (if picture provided) -->
        <div class="card-image" v-if="activity.picture">
          <figure class="image is-3by1">
            <img :src="activity.picture" :alt="activity.title" />
          </figure>
        </div>

        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <!-- Activity type icon -->
              <figure class="image is-48x48">
                <span class="icon is-large has-text-info">
                  <i class="fas fa-2x" :class="{
                    'fa-running': activity.type === 'Running',
                    'fa-walking': activity.type === 'Walking',
                    'fa-biking': activity.type === 'Cycling',
                    'fa-swimmer': activity.type === 'Swimming',
                    'fa-dumbbell': activity.type === 'Weightlifting',
                    'fa-spa': activity.type === 'Yoga',
                    'fa-fire': activity.type === 'HIIT',
                    'fa-futbol': activity.type === 'Sports',
                    'fa-heartbeat': !['Running', 'Walking', 'Cycling', 'Swimming', 'Weightlifting', 'Yoga', 'HIIT', 'Sports'].includes(activity.type)
                  }"></i>
                </span>
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">{{ activity.title }}</p>
              <p class="subtitle is-6">
                <span class="tag is-info is-light">{{ activity.type }}</span>
                <span class="tag ml-2" :class="getIntensityClass(activity.intensity)" v-if="activity.intensity">
                  {{ activity.intensity }}
                </span>
              </p>
            </div>
            <div class="media-right">
              <!-- Edit and Delete buttons -->
              <div class="buttons">
                <button class="button is-small is-warning" @click="editActivity(activity)" title="Edit">
                  <span class="icon">
                    <i class="fas fa-edit"></i>
                  </span>
                </button>
                <button class="button is-small is-danger" @click="deleteActivity(activity.id)" title="Delete">
                  <span class="icon">
                    <i class="fas fa-trash"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div class="content">
            <!-- Activity details -->
            <div class="mb-3">
              <span class="icon-text" v-if="activity.duration">
                <span class="icon"><i class="fas fa-clock"></i></span>
                <span>{{ activity.duration }} minutes</span>
              </span>
            </div>

            <!-- Notes -->
            <p v-if="activity.notes">{{ activity.notes }}</p>

            <!-- Date -->
            <br />
            <time :datetime="activity.date">
              <span class="icon"><i class="fas fa-calendar"></i></span>
              {{ formatDate(activity.date) }}
            </time>
          </div>
        </div>
      </div>
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
                  <input
                    class="input"
                    type="date"
                    v-model="activityForm.date"
                    :max="today"
                  />
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
                    'is-danger': activityForm.intensity === level && (level === 'Hard' || level === 'Extreme'),
                    'is-selected': activityForm.intensity === level
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
            <label class="label">Picture URL <span class="has-text-grey-light">(optional)</span></label>
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
