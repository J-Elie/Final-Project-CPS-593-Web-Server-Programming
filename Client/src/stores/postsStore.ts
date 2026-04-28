/**
 * postsStore.ts
 * =============
 * This Pinia store manages the global state for posts/activities in the application.
 */

// ============================================================================
// IMPORTS
// ============================================================================
// Pinia's defineStore function to create a new store
import { defineStore } from 'pinia'
// TypeScript types for Post and Comment objects
import type { Post, Comment } from '../../../Server/Types/posts'
import type { DataListEnvelope } from '../../../Server/Types/dataEnvelopes'
// Vue's ref and computed for reactive data
import { ref, computed, watch } from 'vue'

import { useSessionStore } from './session'

// ============================================================================
// POSTS STORE DEFINITION
// ============================================================================
export const usePostsStore = defineStore('posts', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const posts = ref<Post[]>([])

  function sessionApi() {
    return useSessionStore().api
  }

  async function fetchPosts() {
    const data = await sessionApi()<DataListEnvelope<Post>>('posts?pageSize=1000')
    posts.value = data.data
  }

  watch(
    () => useSessionStore().token,
    (newToken) => {
      if (newToken) fetchPosts()
    },
  )

  // ============================================================================
  // GETTERS
  // ============================================================================
  const getPostsByUserId = computed(() => {
    return (userId: number) => posts.value.filter((post) => post.userId === userId)
  })

  const getPostById = computed(() => {
    return (postId: number) => posts.value.find((post) => post.id === postId)
  })

  const getFeedPosts = computed(() => {
    return (userIds: number[]) =>
      posts.value
        .filter((post) => userIds.includes(post.userId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async function addPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) {
    const response = await sessionApi()<{ data: Post }>('posts', post)
    const newPost = response.data
    posts.value.unshift(newPost)
    return newPost
  }

  /**
   * updatePost - Updates an existing post
   * Note: id and userId cannot be changed
   */
  async function updatePost(postId: number, updates: Partial<Omit<Post, 'id' | 'userId'>>) {
    const response = await sessionApi()<{ data: Post }>(`posts/${postId}`, updates, { method: 'PATCH' })
    const updatedPost = response.data
    const index = posts.value.findIndex((p) => p.id === postId)
    if (index !== -1) {
      posts.value[index] = updatedPost
    }
  }

  /**
   * deletePost - Removes a post from the store
   */
  async function deletePost(postId: number) {
    await sessionApi()(`posts/${postId}`, undefined, { method: 'DELETE' })
    const index = posts.value.findIndex((p) => p.id === postId)
    if (index !== -1) {
      posts.value.splice(index, 1)
    }
  }

  /**
   * toggleLike - Adds or removes a like from a post, persisted to the DB
   */
  async function toggleLike(postId: number, userId: number) {
    // Optimistic local update
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      if (!post.likes) post.likes = []
      const likeIndex = post.likes.indexOf(userId)
      if (likeIndex === -1) {
        post.likes.push(userId)
      } else {
        post.likes.splice(likeIndex, 1)
      }
    }
    // Persist and sync with server response
    const response = await sessionApi()<{ data: number[] }>(
      `likes/post/${postId}`,
      { userId },
      { method: 'PATCH' },
    )
    if (post) {
      post.likes = response.data
    }
  }

  /**
   * fetchComments - Loads comments from the server into a post
   */
  async function fetchComments(postId: number) {
    const response = await sessionApi()<{ data: Comment[] }>(`comments/post/${postId}`)
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      post.comments = response.data
    }
    return response.data
  }

  /**
   * addComment - Adds a comment to a post
   */
  async function addComment(postId: number, userId: number, content: string) {
    const response = await sessionApi()<{ data: Comment }>(`comments/post/${postId}`, { userId, content })
    const newComment = response.data
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      if (!post.comments) post.comments = []
      post.comments.push(newComment)
    }
    return newComment
  }

  /**
   * deleteComment - Removes a comment from a post
   */
  async function deleteComment(postId: number, commentId: number) {
    await sessionApi()(`comments/post/${postId}/${commentId}`, undefined, { method: 'DELETE' })
    const post = posts.value.find((p) => p.id === postId)
    if (post && post.comments) {
      const commentIndex = post.comments.findIndex((c) => c.id === commentId)
      if (commentIndex !== -1) {
        post.comments.splice(commentIndex, 1)
      }
    }
  }

  // ============================================================================
  // RETURN STORE PROPERTIES
  // ============================================================================
  return {
    // State
    posts,
    // Getters
    getPostsByUserId,
    getPostById,
    getFeedPosts,
    // Actions
    fetchPosts,
    addPost,
    updatePost,
    deletePost,
    toggleLike,
    fetchComments,
    addComment,
    deleteComment,
  }
})
