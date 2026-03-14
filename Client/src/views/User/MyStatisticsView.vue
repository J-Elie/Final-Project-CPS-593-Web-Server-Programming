<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import type { Post } from '@/types/posts'
import StatusTag from '@/components/ui/StatusTag.vue'

const authStore = useAuthStore()
const postsStore = usePostsStore()

// ============================================================================
// DATE HELPERS
// ============================================================================
function getStartOfWeek(): Date {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay())
  sunday.setHours(0, 0, 0, 0)
  return sunday
}

function getStartOfMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// ============================================================================
// RAW DATA
// ============================================================================
const myPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

const weekPosts = computed(() => {
  const start = getStartOfWeek()
  return myPosts.value.filter((p) => new Date(p.date) >= start)
})

const monthPosts = computed(() => {
  const start = getStartOfMonth()
  return myPosts.value.filter((p) => new Date(p.date) >= start)
})

const allPosts = computed(() => myPosts.value)

// ============================================================================
// STAT CALCULATORS
// ============================================================================
function parseDuration(duration: string | number): number {
  if (!duration) return 0
  const str = String(duration)
  if (str.includes(':')) {
    const [h, m] = str.split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  return parseInt(str) || 0
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, '0')}m`
}

const intensityMap: Record<string, number> = {
  low: 1,
  easy: 1,
  moderate: 2,
  medium: 2,
  hard: 3,
  extreme: 3,
  intense: 3,
}

const intensityLabel: Record<number, string> = {
  1: 'Easy',
  2: 'Moderate',
  3: 'Hard',
}

function avgIntensity(posts: Post[]): string {
  if (posts.length === 0) return '—'
  const values = posts.map((p) => intensityMap[String(p.intensity).toLowerCase()] ?? 2)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const rounded = Math.round(avg)
  return intensityLabel[rounded] ?? 'Moderate'
}

function intensityVariant(label: string): 'success' | 'warning' | 'danger' {
  if (label === 'Easy') return 'success'
  if (label === 'Hard') return 'danger'
  return 'warning'
}

function mostPopular(posts: Post[]): { type: string; count: number } | null {
  if (posts.length === 0) return null
  const counts: Record<string, number> = {}
  posts.forEach((p) => {
    counts[p.type || 'Unknown'] = (counts[p.type || 'Unknown'] || 0) + 1
  })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  if (!top) return null
  return { type: top[0], count: top[1] }
}

function longestSession(posts: Post[]): { title: string; duration: string } | null {
  if (posts.length === 0) return null
  const top = [...posts].sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration))[0]
  if (!top) return null
  return { title: top.title, duration: formatDuration(parseDuration(top.duration)) }
}

const currentStreak = computed(() => {
  const dates = new Set(allPosts.value.map((p) => p.date.slice(0, 10)))
  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (dates.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
})

const typeBreakdown = computed(() => {
  const counts: Record<string, number> = {}
  allPosts.value.forEach((p) => {
    counts[p.type || 'Unknown'] = (counts[p.type || 'Unknown'] || 0) + 1
  })
  const total = allPosts.value.length
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
})

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    Running: 'fa-running',
    Walking: 'fa-walking',
    Cycling: 'fa-bicycle',
    Swimming: 'fa-swimmer',
    Weightlifting: 'fa-dumbbell',
    Yoga: 'fa-spa',
    Other: 'fa-bolt',
  }
  return icons[type] ?? 'fa-star'
}

const weekStats = computed(() => ({
  posts: weekPosts.value.length,
  duration: formatDuration(weekPosts.value.reduce((s, p) => s + parseDuration(p.duration), 0)),
  popular: mostPopular(weekPosts.value),
  intensity: avgIntensity(weekPosts.value),
  longest: longestSession(weekPosts.value),
}))

const monthStats = computed(() => ({
  posts: monthPosts.value.length,
  duration: formatDuration(monthPosts.value.reduce((s, p) => s + parseDuration(p.duration), 0)),
  popular: mostPopular(monthPosts.value),
  intensity: avgIntensity(monthPosts.value),
  longest: longestSession(monthPosts.value),
}))

const allTimeStats = computed(() => ({
  posts: allPosts.value.length,
  duration: formatDuration(allPosts.value.reduce((s, p) => s + parseDuration(p.duration), 0)),
  popular: mostPopular(allPosts.value),
  intensity: avgIntensity(allPosts.value),
  longest: longestSession(allPosts.value),
}))
</script>

<template>
  <main class="section">
    <div class="container">
      <!-- Page Header -->
      <h1 class="title is-2 has-text-centered">
        <span class="icon-text is-justify-content-center">
          <span class="icon has-text-info mr-4">
            <i class="fas fa-chart-bar"></i>
          </span>
          <span>My Statistics</span>
        </span>
      </h1>
      <p class="subtitle has-text-centered">A breakdown of your fitness progress over time</p>

      <!-- No data state -->
      <div v-if="allTimeStats.posts === 0" class="columns is-centered">
        <div class="column is-three-quarters">
          <div class="notification is-light">
            <p class="has-text-centered">
              <span class="icon is-large"><i class="fas fa-chart-line fa-2x"></i></span>
            </p>
            <p class="has-text-centered">
              No activities yet. Start logging workouts to see your stats!
            </p>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Streak Banner -->
        <div class="columns is-centered mb-5">
          <div class="column is-half">
            <div class="box streak-box has-text-centered">
              <p class="heading has-text-grey">
                <span class="icon has-text-info"><i class="fas fa-fire"></i></span>
                Current Streak
              </p>
              <p class="title is-2 has-text-info">
                {{ currentStreak }} day{{ currentStreak !== 1 ? 's' : '' }}
              </p>
              <p class="heading">consecutive days active</p>
            </div>
          </div>
        </div>

        <!-- 3 Period Columns -->
        <div class="columns is-multiline">
          <!-- This Week -->
          <div class="column is-one-third">
            <div class="box period-box">
              <p class="title is-5 has-text-centered period-heading">
                <span class="icon"><i class="fas fa-calendar-week"></i></span>
                This Week
              </p>
              <hr />

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-dumbbell"></i></span> Activities
                </p>
                <p class="title is-3 has-text-info">{{ weekStats.posts }}</p>
                <p class="heading">sessions</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-clock"></i></span> Time
                  Active
                </p>
                <p class="title is-3 has-text-success">{{ weekStats.duration }}</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-star"></i></span> Most Popular
                </p>
                <template v-if="weekStats.popular">
                  <p class="title is-4 has-text-info">{{ weekStats.popular.type }}</p>
                  <p class="heading">
                    {{ weekStats.popular.count }} session{{
                      weekStats.popular.count !== 1 ? 's' : ''
                    }}
                  </p>
                </template>
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-fire"></i></span> Avg
                  Intensity
                </p>
                <StatusTag
                  v-if="weekStats.intensity !== '—'"
                  :label="weekStats.intensity"
                  :variant="intensityVariant(weekStats.intensity)"
                  size="medium"
                />
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-trophy"></i></span> Longest
                  Session
                </p>
                <template v-if="weekStats.longest">
                  <p class="title is-4 has-text-info">{{ weekStats.longest.duration }}</p>
                  <p class="heading">{{ weekStats.longest.title }}</p>
                </template>
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>
            </div>
          </div>

          <!-- This Month -->
          <div class="column is-one-third">
            <div class="box period-box">
              <p class="title is-5 has-text-centered period-heading">
                <span class="icon"><i class="fas fa-calendar-alt"></i></span>
                This Month
              </p>
              <hr />

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-dumbbell"></i></span> Activities
                </p>
                <p class="title is-3 has-text-info">{{ monthStats.posts }}</p>
                <p class="heading">sessions</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-clock"></i></span> Time
                  Active
                </p>
                <p class="title is-3 has-text-success">{{ monthStats.duration }}</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-star"></i></span> Most Popular
                </p>
                <template v-if="monthStats.popular">
                  <p class="title is-4 has-text-info">{{ monthStats.popular.type }}</p>
                  <p class="heading">
                    {{ monthStats.popular.count }} session{{
                      monthStats.popular.count !== 1 ? 's' : ''
                    }}
                  </p>
                </template>
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-fire"></i></span> Avg
                  Intensity
                </p>
                <StatusTag
                  v-if="monthStats.intensity !== '—'"
                  :label="monthStats.intensity"
                  :variant="intensityVariant(monthStats.intensity)"
                  size="medium"
                />
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-trophy"></i></span> Longest
                  Session
                </p>
                <template v-if="monthStats.longest">
                  <p class="title is-4 has-text-info">{{ monthStats.longest.duration }}</p>
                  <p class="heading">{{ monthStats.longest.title }}</p>
                </template>
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>
            </div>
          </div>

          <!-- All Time -->
          <div class="column is-one-third">
            <div class="box period-box">
              <p class="title is-5 has-text-centered period-heading">
                <span class="icon"><i class="fas fa-infinity"></i></span>
                All Time
              </p>
              <hr />

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-dumbbell"></i></span> Activities
                </p>
                <p class="title is-3 has-text-info">{{ allTimeStats.posts }}</p>
                <p class="heading">sessions</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-clock"></i></span> Time
                  Active
                </p>
                <p class="title is-3 has-text-success">{{ allTimeStats.duration }}</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-star"></i></span> Most Popular
                </p>
                <template v-if="allTimeStats.popular">
                  <p class="title is-4 has-text-info">{{ allTimeStats.popular.type }}</p>
                  <p class="heading">
                    {{ allTimeStats.popular.count }} session{{
                      allTimeStats.popular.count !== 1 ? 's' : ''
                    }}
                  </p>
                </template>
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-success"><i class="fas fa-fire"></i></span> Avg
                  Intensity
                </p>
                <StatusTag
                  v-if="allTimeStats.intensity !== '—'"
                  :label="allTimeStats.intensity"
                  :variant="intensityVariant(allTimeStats.intensity)"
                  size="medium"
                />
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>

              <div class="stat-row has-text-centered">
                <p class="heading has-text-grey">
                  <span class="icon has-text-info"><i class="fas fa-trophy"></i></span> Longest
                  Session
                </p>
                <template v-if="allTimeStats.longest">
                  <p class="title is-4 has-text-info">{{ allTimeStats.longest.duration }}</p>
                  <p class="heading">{{ allTimeStats.longest.title }}</p>
                </template>
                <p v-else class="title is-4 has-text-grey-light">—</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Type Breakdown -->
        <div class="columns is-centered mt-2">
          <div class="column is-three-quarters">
            <div class="box">
              <p class="heading has-text-grey mb-4">
                <span class="icon has-text-info"><i class="fas fa-chart-pie"></i></span>
                Activity Type Breakdown — All Time
              </p>
              <div v-for="item in typeBreakdown" :key="item.type" class="mb-3">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium">
                    <span class="icon has-text-info is-small"
                      ><i :class="['fas', typeIcon(item.type)]"></i
                    ></span>
                    {{ item.type }}
                  </span>
                  <span class="has-text-grey">
                    {{ item.count }} session{{ item.count !== 1 ? 's' : '' }} &nbsp;
                    <strong>{{ item.pct }}%</strong>
                  </span>
                </div>
                <progress class="progress is-info is-small" :value="item.pct" max="100">
                  {{ item.pct }}%
                </progress>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.period-box {
  border-top: 4px solid hsl(204, 86%, 53%);
  transition: box-shadow 0.2s;
  height: 100%;
}
.period-box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.period-heading {
  color: hsl(204, 86%, 53%);
}
.stat-row {
  padding: 1rem 0;
  border-bottom: 1px solid hsl(0, 0%, 93%);
}
.stat-row:last-child {
  border-bottom: none;
}
.streak-box {
  border-top: 4px solid hsl(204, 86%, 53%);
}
.box {
  transition: box-shadow 0.2s;
}
.box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
