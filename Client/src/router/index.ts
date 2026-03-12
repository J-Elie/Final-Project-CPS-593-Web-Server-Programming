import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    // Always scroll to top when navigating to a new route
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/Admin/UserManagement',
      name: 'user-management',
      component: () => import('../views/Admin/UserManagementView.vue'),
    },
    {
      path: '/Admin/FlaggedPosts',
      name: 'flagged-posts',
      component: () => import('../views/Admin/FlaggedPostsView.vue'),
    },

    {
      path: '/User/ActivityFeed',
      name: 'activity-feed',
      component: () => import('../views/User/ActivityFeedView.vue'),
    },
    {
      path: '/User/MyActivity',
      name: 'my-activity',
      component: () => import('../views/User/MyActivityView.vue'),
    },
    {
      path: '/User/MyStatistics',
      name: 'my-statistics',
      component: () => import('../views/User/MyStatisticsView.vue'),
    },
    {
      path: '/User/Profile',
      name: 'profile',
      component: () => import('../views/User/ProfileView.vue'),
    },
  ],
})

export default router
