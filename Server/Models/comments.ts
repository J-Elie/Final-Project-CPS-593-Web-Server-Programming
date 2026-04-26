import type { Comment } from "../Types/comments";
import postsData from "../Data/posts.json";

// Get all comments for a specific post
export function getCommentsByPostId(postId: number): Comment[] {
  const post = postsData.posts.find((p: any) => p.id === postId);
  return post?.comments || [];
}

// Add a comment to a post
export function addComment(
  postId: number,
  comment: Omit<Comment, "id">,
): Comment {
  const post = postsData.posts.find((p: any) => p.id === postId);
  if (!post) throw { status: 404, message: "Post not found" };
  const newComment: Comment = {
    ...comment,
    id: post.comments?.length
      ? Math.max(...post.comments.map((c: any) => c.id)) + 1
      : 1,
    createdAt: new Date().toISOString(),
  };
  post.comments = post.comments || [];
  post.comments.push(newComment);
  return newComment;
}

// Update the content of a comment on a post
export function updateComment(
  postId: number,
  commentId: number,
  content: string,
): Comment | null {
  const post = postsData.posts.find((p: any) => p.id === postId);
  if (!post || !post.comments) return null;
  const comment = post.comments.find((c: any) => c.id === commentId);
  if (!comment) return null;
  (comment as any).content = content;
  return comment as unknown as Comment;
}

// Remove a comment from a post
export function removeComment(
  postId: number,
  commentId: number,
): Comment | null {
  const post = postsData.posts.find((p: any) => p.id === postId);
  if (!post || !post.comments) return null;
  const index = post.comments.findIndex((c: any) => c.id === commentId);
  if (index === -1) return null;
  const removed = post.comments.splice(index, 1)[0];
  return removed;
}
