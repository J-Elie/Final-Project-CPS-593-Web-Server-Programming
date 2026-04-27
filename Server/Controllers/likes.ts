import { Router } from "express";
import {
  getLikesByPostId,
  getLikeUsersForPost,
  getLikeCountByPostId,
  toggleLike,
} from "../Models/likes";
import type { User } from "../Types/users";
import type { DataEnvelope } from "../Types/dataEnvelopes";

const app = Router();

// GET /api/v1/likes/post/:postId — list user IDs who liked a post
app.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const likes = await getLikesByPostId(Number(postId));
  const response: DataEnvelope<number[]> = {
    data: likes,
    isSuccess: true,
  };
  res.send(response);
});

// GET /api/v1/likes/post/:postId/count — get like count for a post
app.get("/post/:postId/count", async (req, res) => {
  const { postId } = req.params;
  const count = await getLikeCountByPostId(Number(postId));
  const response: DataEnvelope<{ count: number }> = {
    data: { count },
    isSuccess: true,
  };
  res.send(response);
});

// GET /api/v1/likes/post/:postId/users — list full user objects who liked a post
app.get("/post/:postId/users", async (req, res) => {
  const { postId } = req.params;
  const users = await getLikeUsersForPost(Number(postId));
  const response: DataEnvelope<User[]> = {
    data: users,
    isSuccess: true,
  };
  res.send(response);
});

// PATCH /api/v1/likes/post/:postId — toggle like, body: { userId }
app.patch("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const likes = await toggleLike(Number(postId), Number(userId));
  const response: DataEnvelope<number[]> = {
    data: likes,
    isSuccess: true,
  };
  res.send(response);
});

export default app;
