// ============================================================================
// IMPORTS
// ============================================================================
import { Router } from "express";
import {
  getCommentsByPostId,
  addComment,
  updateComment,
  removeComment,
} from "../Models/comments";
import type { Comment } from "../Types/comments";
import { DataEnvelope } from "../Types/dataEnvelopes";
import { requireAuth } from "../Middleware/auth";

// ============================================================================
// ROUTER
// ============================================================================
const app = Router();

// --------------------------------------------------------------------------
// GET /api/v1/comments/post/:postId
// Returns all comments for a given post.
// Requires authentication.
// --------------------------------------------------------------------------
app.get("/post/:postId", requireAuth(), async (req, res) => {
  const { postId } = req.params;
  const comments = await getCommentsByPostId(Number(postId));
  const response: DataEnvelope<Comment[]> = {
    data: comments,
    isSuccess: true,
  };
  res.send(response);
});

// --------------------------------------------------------------------------
// POST /api/v1/comments/post/:postId
// Adds a new comment to a post.
// Requires authentication.
// --------------------------------------------------------------------------
app.post("/post/:postId", requireAuth(), async (req, res) => {
  const { postId } = req.params;
  const comment = await addComment(Number(postId), req.body);
  const response: DataEnvelope<Comment> = {
    data: comment,
    isSuccess: true,
  };
  res.send(response);
});

// --------------------------------------------------------------------------
// PATCH /api/v1/comments/post/:postId/:commentId
// Edits the content of an existing comment.
// Requires authentication.
// --------------------------------------------------------------------------
app.patch("/post/:postId/:commentId", requireAuth(), async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  const updated = await updateComment(
    Number(postId),
    Number(commentId),
    content,
  );
  const response: DataEnvelope<Comment> = {
    data: updated,
    isSuccess: true,
  };
  res.send(response);
});

// --------------------------------------------------------------------------
// DELETE /api/v1/comments/post/:postId/:commentId
// Removes a comment from a post.
// Requires authentication.
// --------------------------------------------------------------------------
app.delete("/post/:postId/:commentId", requireAuth(), async (req, res) => {
  const { postId, commentId } = req.params;
  const removed = await removeComment(Number(postId), Number(commentId));
  const response: DataEnvelope<Comment> = {
    data: removed,
    isSuccess: true,
  };
  res.send(response);
});

export default app;
