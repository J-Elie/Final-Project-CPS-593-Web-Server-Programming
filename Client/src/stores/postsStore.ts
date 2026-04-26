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
import { ref, computed } from 'vue'

import { api } from '../Services/myFetch'

// ============================================================================
// POSTS STORE DEFINITION
// ============================================================================
export const usePostsStore = defineStore('posts', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const posts = ref<Post[]>([])

  api<DataListEnvelope<Post>>('posts?pageSize=1000').then((data) => {
    posts.value = data.data
  })

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
    const response = await api<{ data: Post }>('posts', post)
    const newPost = response.data
    posts.value.unshift(newPost)
    return newPost
  }

  /**
   * updatePost - Updates an existing post
   * Note: id and userId cannot be changed
   */
  async function updatePost(postId: number, updates: Partial<Omit<Post, 'id' | 'userId'>>) {
    const response = await api<{ data: Post }>(`posts/${postId}`, updates, { method: 'PATCH' })
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
    await api(`posts/${postId}`, undefined, { method: 'DELETE' })
    const index = posts.value.findIndex((p) => p.id === postId)
    if (index !== -1) {
      posts.value.splice(index, 1)
    }
  }

  /**
   * toggleLike - Adds or removes a like from a post
   */
  function toggleLike(postId: number, userId: number) {
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
  }

  /**
   * addComment - Adds a comment to a post
   */
  async function addComment(postId: number, userId: number, content: string) {
    const response = await api<{ data: Comment }>(`comments/post/${postId}`, { userId, content })
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
    await api(`comments/post/${postId}/${commentId}`, undefined, { method: 'DELETE' })
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
    addPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
  }
})
