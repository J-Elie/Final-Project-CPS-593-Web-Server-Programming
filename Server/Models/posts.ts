import type { Post } from "../Types/posts";
import { PagingRequest } from "../Types/dataEnvelopes";
import { connect, toCamelCase, toSnakeCase } from "./supabase";

export const TABLE_NAME = "posts";

type ItemType = Post;

function transformPost(row: Record<string, unknown>): ItemType {
  const postLikes = (row.post_likes as { user_id: number }[] | null) ?? [];
  const rawComments = (row.comments as Record<string, unknown>[] | null) ?? [];
  const base = toCamelCase(row) as Record<string, unknown>;
  delete base.postLikes;
  base.likes = postLikes.map((l) => l.user_id);
  base.comments = rawComments.map((c) => toCamelCase(c));
  return base as unknown as ItemType;
}

export async function getAll(params: PagingRequest) {
  const db = connect();

  let query = db
    .from(TABLE_NAME)
    .select("*, post_likes(user_id), comments(*)", { count: "estimated" });

  if (params?.search) {
    query = query.ilike("title", `%${params.search}%`);
  }
  if (params?.sortBy) {
    query = query.order(params.sortBy, { ascending: !params.descending });
  }
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const result = await query;

  if (result.error) {
    throw result.error;
  }

  const posts = (result.data as Record<string, unknown>[]).map(transformPost);
  const count = result.count ?? 0;

  return { posts, count };
}

export async function get(id: number): Promise<ItemType> {
  const db = connect();

  const result = await db
    .from(TABLE_NAME)
    .select("*, post_likes(user_id), comments(*)")
    .eq("id", id)
    .single();
  if (result.error) {
    throw result.error;
  }

  if (!result.data) {
    throw { status: 404, message: "Post not found" };
  }
  return transformPost(result.data as Record<string, unknown>);
}

export async function getByUserId(userId: number): Promise<ItemType[]> {
  const db = connect();

  const result = await db
    .from(TABLE_NAME)
    .select("*, post_likes(user_id), comments(*)")
    .eq("user_id", userId);
  if (result.error) {
    throw result.error;
  }
  return (result.data as Record<string, unknown>[]).map(transformPost);
}

export async function create(post: Exclude<ItemType, "id">) {
  const db = connect();
  const result = await db
    .from(TABLE_NAME)
    .insert(toSnakeCase(post as unknown as Record<string, unknown>))
    .select()
    .single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;
}

export async function update(id: number, post: Partial<ItemType>) {
  const db = connect();
  const result = await db
    .from(TABLE_NAME)
    .update(toSnakeCase(post as unknown as Record<string, unknown>))
    .eq("id", id)
    .select()
    .single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;
}

export async function remove(id: number) {
  const db = connect();
  const result = await db
    .from(TABLE_NAME)
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;
}
