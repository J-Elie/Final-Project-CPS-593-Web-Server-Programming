import type { Comment } from "../Types/comments";
import { connect, toCamelCase, toSnakeCase } from "./supabase";

export const TABLE_NAME = "comments";

export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  const db = connect();

  const result = await db.from(TABLE_NAME).select("*").eq("post_id", postId);
  if (result.error) {
    throw result.error;
  }
  return (result.data as Record<string, unknown>[]).map(
    (row) => toCamelCase(row) as unknown as Comment,
  );
}

export async function addComment(
  postId: number,
  comment: Omit<Comment, "id" | "createdAt">,
): Promise<Comment> {
  const db = connect();

  const payload = toSnakeCase({
    ...(comment as unknown as Record<string, unknown>),
    post_id: postId,
  });

  const result = await db.from(TABLE_NAME).insert(payload).select().single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as Comment;
}

export async function updateComment(
  postId: number,
  commentId: number,
  content: string,
): Promise<Comment> {
  const db = connect();

  const result = await db
    .from(TABLE_NAME)
    .update({ content })
    .eq("id", commentId)
    .eq("post_id", postId)
    .select()
    .single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as Comment;
}

export async function removeComment(
  postId: number,
  commentId: number,
): Promise<Comment> {
  const db = connect();

  const result = await db
    .from(TABLE_NAME)
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId)
    .select()
    .single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as Comment;
}
