<script setup lang="ts"></script>

<template>
  <main>
    <!-- Hero Banner Image -->
    <section class="hero is-fullheight-with-navbar has-text-centered banner-hero">
      <div class="hero-body is-justify-content-center">
        <div class="banner-text-box">
          <h1 class="title is-1 has-text-white has-text-shadow">EveryMove</h1>
          <p class="subtitle is-3 has-text-white has-text-shadow">Movement for every body, every ability</p>
          <div class="buttons is-centered mt-5">
            <router-link to="/register" class="button is-primary is-large">
              <span class="icon"><i class="fas fa-user-plus"></i></span>
              <span>Get Started</span>
            </router-link>
            <router-link to="/my-activity" class="button is-light is-large">
              <span class="icon"><i class="fas fa-running"></i></span>
              <span>Track Activity</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Stats Preview -->
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-10">
            <div class="columns">
              <div class="column">
                <div class="box has-text-centered">
                  <span class="icon is-large has-text-info">
                    <i class="fas fa-3x fa-clipboard-list"></i>
                  </span>
                  <p class="title is-4 mt-3">Track</p>
                  <p>Log any activity that works for you</p>
                </div>
              </div>
              <div class="column">
                <div class="box has-text-centered">
                  <span class="icon is-large has-text-success">
                    <i class="fas fa-3x fa-chart-line"></i>
                  </span>
                  <p class="title is-4 mt-3">Progress</p>
                  <p>See your journey over time</p>
                </div>
              </div>
              <div class="column">
                <div class="box has-text-centered">
                  <span class="icon is-large has-text-warning">
                    <i class="fas fa-3x fa-users"></i>
                  </span>
                  <p class="title is-4 mt-3">Connect</p>
                  <p>Share with friends and stay motivated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Welcome Message -->
    <section class="section has-background-light">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-8 has-text-centered">
            <h2 class="title is-3">Your Fitness, Your Way</h2>
            <p class="is-size-5">
              EveryMove is designed to celebrate all types of movement. Whether you're running
              a marathon, doing physical therapy, or taking a short walk, every step counts.
              No pressure, no judgment, just support for your personal journey.
            </p>
            <div class="mt-5">
              <router-link to="/about" class="button is-info">
                <span class="icon"><i class="fas fa-info-circle"></i></span>
                <span>Learn More</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="section">
      <div class="container has-text-centered">
        <h2 class="title is-4">Ready to start tracking?</h2>
        <p class="subtitle">Join EveryMove and celebrate every achievement.</p>
        <router-link to="/register" class="button is-primary is-medium">
          <span class="icon"><i class="fas fa-rocket"></i></span>
          <span>Sign Up Free</span>
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.banner-hero {
  /* background-image: url('https://static.vecteezy.com/system/resources/previews/060/571/719/non_2x/people-of-all-ages-and-abilities-running-and-walking-outdoors-for-exercise-and-health-improvement-vector.jpg'); */
  background-image: url('/Banner.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.has-text-shadow {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.banner-text-box {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 2rem 3rem;
  border-radius: 12px;
}
</style>
