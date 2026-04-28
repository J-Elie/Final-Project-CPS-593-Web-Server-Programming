// ============================================================================
// IMPORTS
// ============================================================================
import { Router } from "express";
import {
  getLikesByPostId,
  getLikeUsersForPost,
  getLikeCountByPostId,
  toggleLike,
} from "../Models/likes";
import type { User } from "../Types/users";
import type { DataEnvelope } from "../Types/dataEnvelopes";
import { requireAuth } from "../Middleware/auth";

// ============================================================================
// ROUTER
// ============================================================================
const app = Router();

// --------------------------------------------------------------------------
// GET /api/v1/likes/post/:postId
// Returns the list of user IDs who liked a post.
// Requires authentication.
// --------------------------------------------------------------------------
app.get("/post/:postId", requireAuth(), async (req, res) => {
  const { postId } = req.params;
  const likes = await getLikesByPostId(Number(postId));
  const response: DataEnvelope<number[]> = {
    data: likes,
    isSuccess: true,
  };
  res.send(response);
});

// --------------------------------------------------------------------------
// GET /api/v1/likes/post/:postId/count
// Returns the total like count for a post.
// Requires authentication.
// --------------------------------------------------------------------------
app.get("/post/:postId/count", requireAuth(), async (req, res) => {
  const { postId } = req.params;
  const count = await getLikeCountByPostId(Number(postId));
  const response: DataEnvelope<{ count: number }> = {
    data: { count },
    isSuccess: true,
  };
  res.send(response);
});

// --------------------------------------------------------------------------
// GET /api/v1/likes/post/:postId/users
// Returns the full user objects for everyone who liked a post.
// Requires authentication.
// --------------------------------------------------------------------------
app.get("/post/:postId/users", requireAuth(), async (req, res) => {
  const { postId } = req.params;
  const users = await getLikeUsersForPost(Number(postId));
  const response: DataEnvelope<User[]> = {
    data: users,
    isSuccess: true,
  };
  res.send(response);
});

// --------------------------------------------------------------------------
// PATCH /api/v1/likes/post/:postId
// Toggles a like on a post. Body: { userId: number }
// Requires authentication.
// --------------------------------------------------------------------------
app.patch("/post/:postId", requireAuth(), async (req, res) => {
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
