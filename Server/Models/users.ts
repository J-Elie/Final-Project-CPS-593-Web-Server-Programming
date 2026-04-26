import type { User } from "../Types/users";
import { PagingRequest } from "../Types/dataEnvelopes";
import { connect, toCamelCase, toSnakeCase } from "./supabase";

export const TABLE_NAME = "users";

type ItemType = User;

export async function getAll(params: PagingRequest) {
  const db = connect();

  let query = db.from(TABLE_NAME).select("*", { count: "estimated" });

  if (params?.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,username.ilike.%${params.search}%`,
    );
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

  const list = (result.data as Record<string, unknown>[]).map(
    (row) => toCamelCase(row) as unknown as ItemType,
  );
  const count = result.count ?? 0;

  return { list, count };
}

export async function get(id: number): Promise<ItemType> {
  const db = connect();

  const result = await db.from(TABLE_NAME).select("*").eq("id", id).single();
  if (result.error) {
    throw result.error;
  }

  if (!result.data) {
    throw { status: 404, message: "User not found" };
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;
}

export async function create(item: Exclude<ItemType, "id">) {
  const db = connect();
  // following/followers are stored in user_follows table, not users
  const { following: _f, followers: _r, ...userFields } = item as any;
  const result = await db
    .from(TABLE_NAME)
    .insert(toSnakeCase(userFields as Record<string, unknown>))
    .select()
    .single();
  if (result.error) {
    throw result.error;
  }
  return toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;
}

export async function update(id: number, item: Partial<ItemType>) {
  const db = connect();
  // following/followers are stored in user_follows table, not users
  const { following: _f, followers: _r, ...userFields } = item as any;
  const result = await db
    .from(TABLE_NAME)
    .update(toSnakeCase(userFields as Record<string, unknown>))
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
