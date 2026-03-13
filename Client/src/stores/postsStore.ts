/**
 * postsStore.ts
 * =============
 * This Pinia store manages the global state for posts/activities in the application.
 */

// ============================================================================
// IMPORTS
// ============================================================================
// Import post data from local JSON file
import data from '../data/posts.json'
// Pinia's defineStore function to create a new store
import { defineStore } from 'pinia'
// TypeScript types for Post and Comment objects
import type { Post, Comment } from '../types/posts'
// Vue's ref and computed for reactive data
import { ref, computed } from 'vue'

// ============================================================================
// POSTS STORE DEFINITION
// ============================================================================
export const usePostsStore = defineStore('posts', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  /**
   * posts - Reactive array containing all post objects
   * Initialized with data loaded from the posts.json file
   */
  const posts = ref<Post[]>(data.posts as Post[])

  /**
   * nextId - Counter for generating unique post IDs
   */
  const nextId = ref(data.posts.length + 1)

  /**
   * nextCommentId - Counter for generating unique comment IDs
   */
  const nextCommentId = ref(100)

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

  function addPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) {
    const newPost: Post = {
      ...post,
      id: nextId.value++,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    }
    posts.value.unshift(newPost)
    return newPost
  }

  /**
   * updatePost - Updates an existing post
   * Note: id and userId cannot be changed
   */
  function updatePost(postId: number, updates: Partial<Omit<Post, 'id' | 'userId'>>) {
    const index = posts.value.findIndex((p) => p.id === postId)
    const existingPost = posts.value[index]
    if (index !== -1 && existingPost) {
      posts.value[index] = {
        ...existingPost,
        ...updates,
        id: existingPost.id,
        userId: existingPost.userId,
      } as Post
    }
  }

  /**
   * deletePost - Removes a post from the store
   */
  function deletePost(postId: number) {
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
  function addComment(postId: number, userId: number, content: string) {
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      if (!post.comments) post.comments = []
      const newComment: Comment = {
        id: nextCommentId.value++,
        userId,
        content,
        createdAt: new Date().toISOString(),
      }
      post.comments.push(newComment)
      return newComment
    }
  }

  /**
   * deleteComment - Removes a comment from a post
   */
  function deleteComment(postId: number, commentId: number) {
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
