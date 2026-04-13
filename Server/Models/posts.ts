import type { Post } from "../Types/posts.ts";
import data from "../Data/posts.json";
import { PagingRequest } from "../Types/dataEnvelopes.ts";

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

  return { posts, count };
}

export function get(id: number): Post {
  const post = data.posts.find((post) => post.id === id);
  if (!post) {
    const error = { status: 404, message: "Post not found" };
    throw error;
  }
  return post as Post;
}

export function getByUserId(userId: number): Post[] {
  return data.posts.filter((post) => post.userId === userId) as Post[];
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
