import { Router } from "express";
import {
  getCommentsByPostId,
  addComment,
  updateComment,
  removeComment,
} from "../Models/comments";
import { Comment } from "../Types/posts";
import { DataEnvelope } from "../Types/dataEnvelopes";

const app = Router();

// Get all comments for a post
app.get("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const comments = getCommentsByPostId(Number(postId));
  const response: DataEnvelope<Comment[]> = {
    data: comments,
    isSuccess: true,
  };
  res.send(response);
});

// Add a comment to a post
app.post("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const comment = addComment(Number(postId), req.body);
  const response: DataEnvelope<Comment> = {
    data: comment,
    isSuccess: true,
  };
  res.send(response);
});

// Edit a comment on a post
app.patch("/post/:postId/:commentId", (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  const updated = updateComment(Number(postId), Number(commentId), content);
  const response: DataEnvelope<Comment | null> = {
    data: updated,
    isSuccess: !!updated,
  };
  res.send(response);
});

// Remove a comment from a post
app.delete("/post/:postId/:commentId", (req, res) => {
  const { postId, commentId } = req.params;
  const removed = removeComment(Number(postId), Number(commentId));
  const response: DataEnvelope<Comment | null> = {
    data: removed,
    isSuccess: !!removed,
  };
  res.send(response);
});

export default app;
