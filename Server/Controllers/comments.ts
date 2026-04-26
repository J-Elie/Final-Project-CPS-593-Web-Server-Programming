import { Router } from "express";
import {
  getCommentsByPostId,
  addComment,
  updateComment,
  removeComment,
} from "../Models/comments";
import type { Comment } from "../Types/comments";
import { DataEnvelope } from "../Types/dataEnvelopes";

const app = Router();

// Get all comments for a post
app.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const comments = await getCommentsByPostId(Number(postId));
  const response: DataEnvelope<Comment[]> = {
    data: comments,
    isSuccess: true,
  };
  res.send(response);
});

// Add a comment to a post
app.post("/post/:postId", async (req, res) => {
  const { postId } = req.params;
  const comment = await addComment(Number(postId), req.body);
  const response: DataEnvelope<Comment> = {
    data: comment,
    isSuccess: true,
  };
  res.send(response);
});

// Edit a comment on a post
app.patch("/post/:postId/:commentId", async (req, res) => {
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

// Remove a comment from a post
app.delete("/post/:postId/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;
  const removed = await removeComment(Number(postId), Number(commentId));
  const response: DataEnvelope<Comment> = {
    data: removed,
    isSuccess: true,
  };
  res.send(response);
});

export default app;
