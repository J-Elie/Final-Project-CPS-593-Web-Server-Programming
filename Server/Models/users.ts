import type { User } from "../Types/users";
import { PagingRequest } from "../Types/dataEnvelopes";
import { connect, toCamelCase, toSnakeCase } from "./supabase";
import { sign } from "jsonwebtoken";

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

  const userIds = (result.data as Record<string, unknown>[]).map(
    (row) => row.id as number,
  );

  // Fetch all follow relationships for these users in one query
  const followsResult = await db
    .from("user_follows")
    .select("follower_id, following_id")
    .or(
      `follower_id.in.(${userIds.join(",")}),following_id.in.(${userIds.join(",")})`,
    );

  const followRows = (followsResult.data ?? []) as {
    follower_id: number;
    following_id: number;
  }[];

  const list = (result.data as Record<string, unknown>[]).map((row) => {
    const user = toCamelCase(row) as unknown as ItemType;
    user.following = followRows
      .filter((f) => f.follower_id === row.id)
      .map((f) => f.following_id);
    user.followers = followRows
      .filter((f) => f.following_id === row.id)
      .map((f) => f.follower_id);
    return user;
  });
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
  const user = toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;

  // Populate following / followers from user_follows table
  const [followingResult, followersResult] = await Promise.all([
    db.from("user_follows").select("following_id").eq("follower_id", id),
    db.from("user_follows").select("follower_id").eq("following_id", id),
  ]);
  user.following = (
    (followingResult.data ?? []) as { following_id: number }[]
  ).map((r) => r.following_id);
  user.followers = (
    (followersResult.data ?? []) as { follower_id: number }[]
  ).map((r) => r.follower_id);

  return user;
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

export async function follow(followerId: number, followingId: number) {
  const db = connect();
  const result = await db
    .from("user_follows")
    .insert({ follower_id: followerId, following_id: followingId });
  if (result.error) {
    throw result.error;
  }
}

export async function unfollow(followerId: number, followingId: number) {
  const db = connect();
  const result = await db
    .from("user_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (result.error) {
    throw result.error;
  }
}

export async function getFollowing(userId: number): Promise<ItemType[]> {
  const db = connect();
  const result = await db
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (result.error) throw result.error;
  const ids = ((result.data ?? []) as { following_id: number }[]).map(
    (r) => r.following_id,
  );
  if (ids.length === 0) return [];
  const usersResult = await db.from(TABLE_NAME).select("*").in("id", ids);
  if (usersResult.error) throw usersResult.error;
  return ((usersResult.data ?? []) as Record<string, unknown>[]).map(
    (row) => toCamelCase(row) as unknown as ItemType,
  );
}

export async function getFollowers(userId: number): Promise<ItemType[]> {
  const db = connect();
  const result = await db
    .from("user_follows")
    .select("follower_id")
    .eq("following_id", userId);
  if (result.error) throw result.error;
  const ids = ((result.data ?? []) as { follower_id: number }[]).map(
    (r) => r.follower_id,
  );
  if (ids.length === 0) return [];
  const usersResult = await db.from(TABLE_NAME).select("*").in("id", ids);
  if (usersResult.error) throw usersResult.error;
  return ((usersResult.data ?? []) as Record<string, unknown>[]).map(
    (row) => toCamelCase(row) as unknown as ItemType,
  );
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

export async function login(
  email: string,
  _password?: string,
): Promise<{ token: string; user: ItemType }> {
  const db = connect();
  const result = await db
    .from(TABLE_NAME)
    .select("*")
    .eq("email", email)
    .single();
  if (result.error || !result.data) {
    throw { status: 401, message: "Invalid email" };
  }
  const user = toCamelCase(
    result.data as Record<string, unknown>,
  ) as unknown as ItemType;
  /* If we had passwords, we would verify them here.
  if (!user || user.password !== _password) {
    throw { status: 401, message: "Invalid email or password" };
  }
  */
  return new Promise((resolve, reject) => {
    sign(
      user as object,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" },
      (err, token) => {
        if (err || !token) {
          reject(err || new Error("Token generation failed"));
          return;
        }
        resolve({ token, user });
      },
    );
  });
}

export async function seed() {
  // Seed function placeholder — data is managed via seed.sql
}
