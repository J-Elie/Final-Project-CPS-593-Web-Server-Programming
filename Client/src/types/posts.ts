/**
 * posts.ts
 * ========
 */

// ============================================================================
// COMMENT TYPE
// ============================================================================
export type Comment = {
  id: number
  userId: number
  content: string
  createdAt: string
}

// ============================================================================
// POST TYPE
// ============================================================================
export type Post = {
  id: number
  userId: number
  title: string
  type: string
  date: string
  duration: string
  intensity: string
  picture: string
  notes: string
  createdAt: string
  likes: number[]
  comments: Comment[]
}
