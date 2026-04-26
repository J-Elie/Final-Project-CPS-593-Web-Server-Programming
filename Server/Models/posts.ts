import type { Post, Comment } from "../Types/posts.ts";
import data from "../Data/posts.json";
import usersData from "../Data/users.json";
import { PagingRequest } from "../Types/dataEnvelopes.ts";
// Helper to get user details by userId
function getUserDetails(userId: number) {
  const user = usersData.users.find((u: any) => u.id === userId);
  if (!user) return null;
  // Only return selected user fields for privacy
  return {
    id: user.id,
    firstName: user.firstName,
    username: user.username,
    image: user.image,
    role: user.role,
    bio: user.bio,
  };
}

export function getAll(params: PagingRequest) {
  let posts = data.posts as Post[];
  const count = posts.length;

  if (params?.search) {
    const search = params.search.toLowerCase();
    posts = posts.filter((post) =>
      `${post.title}`.toLowerCase().includes(search),
    );
  }
  if (params?.sortBy) {
    const { sortBy, descending } = params;
    posts = posts.sort((a, b) => {
      if (a[sortBy as keyof Post]! < b[sortBy as keyof Post]!)
        return descending ? 1 : -1;
      if (a[sortBy as keyof Post]! > b[sortBy as keyof Post]!)
        return descending ? -1 : 1;
      return 0;
    });
  }
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  posts = posts.slice(start, start + pageSize);

  // Attach user details to each post
  const postsWithUser = posts.map((post) => ({
    ...post,
    user: getUserDetails(post.userId),
  }));

  return { posts: postsWithUser, count };
}

export function get(id: number): Post & { user: any } {
  const post = data.posts.find((post) => post.id === id);
  if (!post) {
    const error = { status: 404, message: "Post not found" };
    throw error;
  }
  return {
    ...post,
    user: getUserDetails(post.userId),
  } as Post & { user: any };
}

export function getByUserId(userId: number): (Post & { user: any })[] {
  return data.posts
    .filter((post) => post.userId === userId)
    .map((post) => ({
      ...post,
      user: getUserDetails(post.userId),
    }));
}

export function create(post: Post) {
  const newPost = {
    ...post,
    id: data.posts.length + 1,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
  };
  data.posts.push(newPost as any);
  return newPost;
}

export function update(id: number, post: Partial<Post>) {
  const index = data.posts.findIndex((p) => p.id === id);
  if (index === -1) {
    const error = { status: 404, message: "Post not found" };
    throw error;
  }
  const updatedPost = {
    ...data.posts[index],
    ...post,
  };
  data.posts[index] = updatedPost as any;
  return updatedPost;
}

export function remove(id: number) {
  const index = data.posts.findIndex((p) => p.id === id);
  if (index === -1) {
    const error = { status: 404, message: "Post not found" };
    throw error;
  }
  const removedPost = data.posts.splice(index, 1)[0];
  return removedPost as Post;
}
