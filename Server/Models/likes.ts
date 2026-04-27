import type { User } from "../Types/users";
import { connect, toCamelCase } from "./supabase";

// ============================================================================
// GET LIKE COUNT FOR A POST
// ============================================================================
export async function getLikeCountByPostId(postId: number): Promise<number> {
  const db = connect();
  const result = await db
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  if (result.error) throw result.error;
  return result.count ?? 0;
}

// ============================================================================
// GET LIKES (user IDs) FOR A POST
// ============================================================================
export async function getLikesByPostId(postId: number): Promise<number[]> {
  const db = connect();
  const result = await db
    .from("post_likes")
    .select("user_id")
    .eq("post_id", postId);
  if (result.error) throw result.error;
  return (result.data as { user_id: number }[]).map((r) => r.user_id);
}

// ============================================================================
// GET FULL USER OBJECTS FOR USERS WHO LIKED A POST
// ============================================================================
export async function getLikeUsersForPost(postId: number): Promise<User[]> {
  const db = connect();
  const result = await db
    .from("post_likes")
    .select("users(*)")
    .eq("post_id", postId);
  if (result.error) throw result.error;
  return (result.data as unknown as { users: Record<string, unknown> }[]).map(
    (r) => toCamelCase(r.users) as unknown as User,
  );
}

// ============================================================================
// TOGGLE LIKE (add or remove) — RETURNS UPDATED LIST OF USER IDs
// ============================================================================
export async function toggleLike(
  postId: number,
  userId: number,
): Promise<number[]> {
  const db = connect();

  const existing = await db
    .from("post_likes")
    .select("user_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.data) {
    const del = await db
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (del.error) throw del.error;
  } else {
    const ins = await db
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });
    if (ins.error) throw ins.error;
  }

  return getLikesByPostId(postId);
}
