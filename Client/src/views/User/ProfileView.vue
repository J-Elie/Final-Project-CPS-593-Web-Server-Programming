<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { computed } from 'vue'

const authStore = useAuthStore()
const postsStore = usePostsStore()

// Get current user's posts
const userPosts = computed(() => {
  if (!authStore.currentUser) return []
  return postsStore.getPostsByUserId(authStore.currentUser.id)
})

// Calculate total activities
const totalActivities = computed(() => userPosts.value.length)
</script>

<template>
  <main>
    <!-- Hero Section -->
    <section class="hero is-primary is-medium mt-5">
      <div class="hero-body">
        <div class="container has-text-centered">
          <p class="title">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-user-circle"></i>
              </span>
              <span>My Profile</span>
            </span>
          </p>
          <p class="subtitle">View and manage your account</p>
        </div>
      </div>
    </section>

    <!-- Profile Content -->
    <section class="section">
      <div class="container">
        <!-- Not Logged In Message -->
        <div v-if="!authStore.isLoggedIn" class="notification is-warning has-text-centered">
          <p class="is-size-5">
            <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
            Please <router-link to="/login">log in</router-link> to view your profile.
          </p>
        </div>

        <!-- Profile Card -->
        <div v-else class="columns is-centered">
          <div class="column is-8">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <figure class="image is-128x128">
                      <img
                        v-if="authStore.currentUser?.image"
                        class="is-rounded"
                        :src="authStore.currentUser?.image"
                        :alt="authStore.currentUser?.firstName"
                      />
                      <span v-else class="icon has-text-grey" style="font-size: 8rem">
                        <i class="fas fa-user-circle"></i>
                      </span>
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-3">{{ authStore.currentUser?.firstName }}</p>
                    <p class="subtitle is-5 has-text-grey">
                      @{{ authStore.currentUser?.username }}
                    </p>
                    <span class="tag is-info is-medium">
                      <span class="icon"><i class="fas fa-user-tag"></i></span>
                      <span>{{ authStore.currentUser?.role }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="columns mt-5">
              <div class="column">
                <div class="box has-text-centered">
                  <p class="heading">Following</p>
                  <p class="title">{{ authStore.currentUser?.following?.length || 0 }}</p>
                </div>
              </div>
              <div class="column">
                <div class="box has-text-centered">
                  <p class="heading">Followers</p>
                  <p class="title">{{ authStore.currentUser?.followers?.length || 0 }}</p>
                </div>
              </div>
              <div class="column">
                <div class="box has-text-centered">
                  <p class="heading">Activities</p>
                  <p class="title">{{ totalActivities }}</p>
                </div>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="box mt-5">
              <h3 class="title is-5 mb-4">Quick Links</h3>
              <div class="buttons">
                <router-link to="/User/MyActivity" class="button is-primary">
                  <span class="icon"><i class="fas fa-running"></i></span>
                  <span>My Activities</span>
                </router-link>
                <router-link to="/User/MyStatistics" class="button is-info">
                  <span class="icon"><i class="fas fa-chart-bar"></i></span>
                  <span>My Statistics</span>
                </router-link>
                <router-link to="/User/ActivityFeed" class="button is-success">
                  <span class="icon"><i class="fas fa-users"></i></span>
                  <span>Friends Feed</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.image.is-128x128 img {
  width: 128px;
  height: 128px;
  object-fit: cover;
}
</style>
