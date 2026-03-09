<script setup lang="ts"></script>

<template>
  <main>
    <!-- Hero Section -->
    <section class="hero is-info is-medium mt-5">
      <div class="hero-body">
        <div class="container has-text-centered">
          <p class="title">
            <span class="icon-text">
              <span class="icon">
                <i class="fas fa-heart"></i>
              </span>
              <span>About EveryMove</span>
            </span>
          </p>
          <p class="subtitle">Movement for every body, every ability</p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-8">
            <div class="content has-text-centered">
              <h2 class="title is-3">Our Mission</h2>
              <p class="is-size-5">
                EveryMove was created with one belief <strong>fitness is for everyone</strong>.
                Movement looks different for every person, and that's something to celebrate.
                Whatever your abilities or challenges, your movement matters.
              </p>
              <p class="is-size-5 mt-4">
                As someone with a disability, I know tracking activity can feel daunting, and
                sometimes traditional exercise just isn't an option. For this graduate class
                project, I wanted to create an inclusive fitness tracker that doesn't assume
                what "exercise" should look like and celebrates every achievement, big or small.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Inclusivity Section -->
    <section class="section has-background-primary-light">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-8 has-text-centered">
            <span class="icon is-large has-text-primary">
              <i class="fas fa-3x fa-universal-access"></i>
            </span>
            <h2 class="title is-3 mt-4">Built for Everyone</h2>
            <p class="is-size-5">
              EveryMove welcomes all abilities. Track adaptive sports, physical therapy, seated
              exercises, or any movement that works for you. No streaks, no pressure just
              celebrating every step of your journey.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section has-background-light">
      <div class="container">
        <h2 class="title is-3 has-text-centered mb-6">Features</h2>
        <div class="columns is-multiline">
          <!-- Feature 1 -->
          <div class="column is-4">
            <div class="card">
              <div class="card-content has-text-centered">
                <span class="icon is-large has-text-info">
                  <i class="fas fa-3x fa-running"></i>
                </span>
                <p class="title is-4 mt-4">Activity Tracking</p>
                <p>
                  Log all your workouts including running, cycling, swimming, weightlifting, and
                  more. Track duration, intensity, and add personal notes.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="column is-4">
            <div class="card">
              <div class="card-content has-text-centered">
                <span class="icon is-large has-text-success">
                  <i class="fas fa-3x fa-chart-line"></i>
                </span>
                <p class="title is-4 mt-4">Progress Stats</p>
                <p>
                  View your activity statistics and see how you're improving over time. Track your
                  total workouts, favorite activities, and more.
                </p>
              </div>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="column is-4">
            <div class="card">
              <div class="card-content has-text-centered">
                <span class="icon is-large has-text-warning">
                  <i class="fas fa-3x fa-users"></i>
                </span>
                <p class="title is-4 mt-4">Social Features</p>
                <p>
                  Connect with friends, view their activities, and stay motivated together. Fitness
                  is better with community support!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="section">
      <div class="container">
        <h2 class="title is-3 has-text-centered mb-6">Built With</h2>
        <div class="columns is-centered">
          <div class="column is-8">
            <div class="tags is-centered are-medium">
              <span class="tag is-success is-light">
                <span class="icon"><i class="fab fa-vuejs"></i></span>
                <span>Vue.js 3</span>
              </span>
              <span class="tag is-info is-light">
                <span class="icon"><i class="fab fa-css3-alt"></i></span>
                <span>Bulma CSS</span>
              </span>
              <span class="tag is-primary is-light">
                <span class="icon"><i class="fab fa-js"></i></span>
                <span>TypeScript</span>
              </span>
              <span class="tag is-warning is-light">
                <span class="icon"><i class="fas fa-bolt"></i></span>
                <span>Vite</span>
              </span>
              <span class="tag is-danger is-light">
                <span class="icon"><i class="fas fa-route"></i></span>
                <span>Vue Router</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section has-background-info-light">
      <div class="container has-text-centered">
        <h2 class="title is-3">Ready to Start?</h2>
        <p class="subtitle">Your movement journey begins here at your own pace.</p>
        <div class="buttons is-centered">
          <router-link to="/register" class="button is-primary is-medium">
            <span class="icon"><i class="fas fa-user-plus"></i></span>
            <span>Sign Up Now</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer Info -->
    <section class="section">
      <div class="container has-text-centered">
        <p class="has-text-grey">
          <span class="icon"><i class="fas fa-code"></i></span>
          CPS-593 Final Project | Built with
          <span class="has-text-danger"><i class="fas fa-heart"></i></span> for every body
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped></style>
