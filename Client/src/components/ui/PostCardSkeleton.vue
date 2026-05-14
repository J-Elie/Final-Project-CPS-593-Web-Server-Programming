<script setup lang="ts">
withDefaults(
  defineProps<{
    /** How many skeleton cards to render */
    count?: number
    /** How many action pill buttons to show in the bottom row */
    actions?: number
  }>(),
  { count: 5, actions: 2 },
)
</script>

<template>
  <div v-for="n in count" :key="n" class="card mb-4">
    <!-- card-image placeholder (matches the 3by1 banner) -->
    <div class="card-image">
      <figure class="image is-3by1 is-skeleton"></figure>
    </div>

    <div class="card-content">
      <!-- media row: avatar/icon + title + tags + optional action buttons -->
      <div class="media mb-0">
        <div class="media-left">
          <figure class="image is-48x48 is-skeleton"></figure>
        </div>

        <div class="media-content">
          <!-- author name line (shown when showAuthor) -->
          <div class="is-skeleton mb-2" style="height: 0.85rem; width: 40%"></div>
          <!-- title -->
          <div class="is-skeleton mb-2" style="height: 1.25rem; width: 70%"></div>
          <!-- type + intensity tags -->
          <div class="tags mb-0">
            <span class="tag is-skeleton" style="width: 5rem"></span>
            <span class="tag is-skeleton ml-2" style="width: 4.5rem"></span>
          </div>
        </div>

        <!-- edit / delete buttons placeholder -->
        <div class="media-right" v-if="actions > 0">
          <div class="buttons">
            <button
              v-for="a in actions"
              :key="a"
              class="button is-small is-skeleton"
              style="width: 2rem"
            ></button>
          </div>
        </div>
      </div>

      <!-- content section -->
      <div class="content mt-3">
        <!-- duration line -->
        <div class="is-skeleton mb-3" style="height: 0.85rem; width: 35%"></div>
        <!-- notes lines -->
        <div class="skeleton-lines mb-3">
          <div></div>
          <div></div>
          <div style="width: 60%"></div>
        </div>
        <!-- date line -->
        <div class="is-skeleton mb-3" style="height: 0.8rem; width: 30%"></div>
        <!-- like / comment buttons -->
        <div class="level is-mobile mt-3">
          <div class="level-left">
            <button class="button is-small is-skeleton mr-2" style="width: 4.5rem"></button>
            <button class="button is-small is-skeleton" style="width: 4.5rem"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
