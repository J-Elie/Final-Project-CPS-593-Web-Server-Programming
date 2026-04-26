import { Router } from "express";
import {
  getAll,
  get,
  getByUserId,
  create,
  update,
  remove,
} from "../Models/posts.ts";
import { Post, DataEnvelope, DataListEnvelope } from "../Types/posts.ts";

const app = Router();

app
  .get("/", (req, res) => {
    const { posts, count } = getAll(req.query);
    const response: DataListEnvelope<Post> = {
      data: posts,
      isSuccess: true,
      total: count,
    };
    res.send(response);
  })
  .get("/count", (req, res) => {
    const { count } = getAll(req.query);
    const response: DataEnvelope<{ count: number }> = {
      data: { count },
      isSuccess: true,
    };
    res.send(response);
  })
  .get("/:id", (req, res) => {
    const { id } = req.params;
    const response: DataEnvelope<Post> = {
      data: get(Number(id)),
      isSuccess: true,
    };
    res.send(response);
  })
  .post("/", (req, res) => {
    const newPost = create(req.body);
    const response: DataEnvelope<Post> = {
      data: newPost,
      isSuccess: true,
    };
    res.send(response);
  })
  .patch("/:id", (req, res) => {
    const { id } = req.params;
    const updatedPost = update(Number(id), req.body);
    const response: DataEnvelope<Post> = {
      data: updatedPost as Post,
      isSuccess: true,
    };
    res.send(response);
  })
  .delete("/:id", (req, res) => {
    const { id } = req.params;
    const removedPost = remove(Number(id));
    const response: DataEnvelope<Post> = {
      data: removedPost,
      isSuccess: true,
      message: `Post ${removedPost.title} has been removed.`,
    };
    res.send(response);
  });

export default app;
