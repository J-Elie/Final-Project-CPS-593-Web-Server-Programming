<script setup lang="ts">
/**
 * AddActivityForm.vue
 * ====================
 * Reusable form component for adding or editing an activity/post.
 * Accepts an optional activity prop for edit mode.
 * Emits 'submit' with form data and 'cancel' when dismissed.
 */
import { ref, computed, watch } from 'vue'
import type { Post } from '@/types/posts'
import AddButton from '@/components/ui/buttons/AddButton.vue'
import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps<{
  activity?: Post | null
}>()

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits<{
  submit: [
    formData: {
      title: string
      type: string
      date: string
      duration: string
      intensity: string
      picture: string
      notes: string
    },
  ]
  cancel: []
}>()

// ============================================================================
// FORM STATE
// ============================================================================
const activityForm = ref({
  title: '',
  type: '',
  date: '',
  duration: '',
  intensity: '',
  picture: '',
  notes: '',
})

// Duration split into hours and minutes for the two-part input
const durationHours = ref(0)
const durationMinutes = ref(0)

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
const intensityLevels = ['Easy', 'Moderate', 'Hard']

// Get today's date in YYYY-MM-DD format for date input max attribute
const today = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

// ============================================================================
// WATCHERS
// ============================================================================
// When the activity prop changes (e.g. opening edit mode), populate the form
watch(
  () => props.activity,
  (newActivity) => {
    if (newActivity) {
      const totalMins = parseInt(newActivity.duration) || 0
      durationHours.value = Math.floor(totalMins / 60)
      durationMinutes.value = totalMins % 60
      activityForm.value = {
        title: newActivity.title,
        type: newActivity.type,
        date: newActivity.date,
        duration: newActivity.duration,
        intensity: newActivity.intensity,
        picture: newActivity.picture,
        notes: newActivity.notes,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// Sync hours/minutes inputs back to the total duration string
watch([durationHours, durationMinutes], ([h, m]) => {
  const hours = Math.max(0, h || 0)
  const mins = Math.min(59, Math.max(0, m || 0))
  activityForm.value.duration = String(hours * 60 + mins)
})

// ============================================================================
// FORM FUNCTIONS
// ============================================================================
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
  durationHours.value = 0
  durationMinutes.value = 0
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

// Handle form submission
function handleSubmit() {
  // Auto-set date to today if not provided
  if (!activityForm.value.date) {
    activityForm.value.date = today.value ?? ''
  }
  emit('submit', { ...activityForm.value })
}

// Set the date to today
function setToday() {
  activityForm.value.date = today.value ?? ''
}

// Handle cancel
function handleCancel() {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <div class="box">
    <h2 class="title is-4">{{ activity ? 'Edit Activity' : 'Add New Activity' }}</h2>

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
          <i class="fa-solid fa-pen has-text-info"></i>
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
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" type="date" v-model="activityForm.date" :max="today" />
            </div>
            <div class="control">
              <AddButton label="Today" icon="fas fa-calendar-day" @click="setToday" />
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="field">
          <label class="label">Duration</label>
          <div class="duration-inputs">
            <div class="duration-part">
              <div class="control">
                <input
                  class="input"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="0"
                  v-model.number="durationHours"
                />
              </div>
              <span class="duration-label">hrs</span>
            </div>
            <span class="duration-separator">:</span>
            <div class="duration-part">
              <div class="control">
                <input
                  class="input"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  v-model.number="durationMinutes"
                />
              </div>
              <span class="duration-label">min</span>
            </div>
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
              'is-danger': activityForm.intensity === level && level === 'Hard',
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
        <AddButton
          :label="activity ? 'Update Activity' : 'Save Activity'"
          icon="fas fa-save"
          @click="handleSubmit"
        />
      </div>
      <div class="control">
        <DeleteButton :label="'Close'" :showIcon="false" @click="handleCancel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.duration-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.duration-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.duration-part input {
  text-align: center;
  font-size: 1.1rem;
}

.duration-separator {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: -1.2rem;
}

.duration-label {
  font-size: 0.75rem;
  color: #7a7a7a;
  margin-top: 0.25rem;
}
</style>
