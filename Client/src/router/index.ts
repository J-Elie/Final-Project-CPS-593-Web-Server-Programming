import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      // route level code-splitting
      // this generates a separate chunk (Register.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (Login.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/Admin/UserManagement',
      name: 'user-management',
      // route level code-splitting
      // this generates a separate chunk (UserManagement.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Admin/UserManagementView.vue'),
    },
    {
      path: '/Admin/FlaggedPosts',
      name: 'flagged-posts',
      // route level code-splitting
      // this generates a separate chunk (FlaggedPosts.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Admin/FlaggedPostsView.vue'),
    },

    {
      path: '/User/FriendsActivity',
      name: 'friends-activity',
      // route level code-splitting
      // this generates a separate chunk (FriendsActivity.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/User/FriendsActivityView.vue'),
    },
    {
      path: '/User/MyActivity',
      name: 'my-activity',
      // route level code-splitting
      // this generates a separate chunk (MyActivity.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/User/MyActivityView.vue'),
    },
    {
      path: '/User/mystatistics',
      name: 'my-statistics',
      // route level code-splitting
      // this generates a separate chunk (MyStatistics.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/User/MyStatisticsView.vue'),
    },
  ],
})

export default router
