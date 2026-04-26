import { Router } from "express";
import {
  getAll,
  get,
  getByUserId,
  create,
  update,
  remove,
} from "../Models/posts";
import { Post, DataEnvelope, DataListEnvelope } from "../Types/posts";

const app = Router();

app
  .get("/", async (req, res) => {
    const { posts, count } = await getAll(req.query);
    const response: DataListEnvelope<Post> = {
      data: posts,
      isSuccess: true,
      total: count,
    };
    res.send(response);
  })
  .get("/count", async (req, res) => {
    const { count } = await getAll(req.query);
    const response: DataEnvelope<{ count: number }> = {
      data: { count },
      isSuccess: true,
    };
    res.send(response);
  })
  .get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const posts = await getByUserId(Number(userId));
    const response: DataListEnvelope<Post> = {
      data: posts,
      isSuccess: true,
      total: posts.length,
    };
    res.send(response);
  })
  .get("/:id", async (req, res) => {
    const { id } = req.params;
    const response: DataEnvelope<Post> = {
      data: await get(Number(id)),
      isSuccess: true,
    };
    res.send(response);
  })
  .post("/", async (req, res) => {
    const newPost = await create(req.body);
    const response: DataEnvelope<Post> = {
      data: newPost,
      isSuccess: true,
    };
    res.send(response);
  })
  .patch("/:id", async (req, res) => {
    const { id } = req.params;
    const updatedPost = await update(Number(id), req.body);
    const response: DataEnvelope<Post> = {
      data: updatedPost as Post,
      isSuccess: true,
    };
    res.send(response);
  })
  .delete("/:id", async (req, res) => {
    const { id } = req.params;
    const removedPost = await remove(Number(id));
    const response: DataEnvelope<Post> = {
      data: removedPost,
      isSuccess: true,
      message: `Post ${removedPost.title} has been removed.`,
    };
    res.send(response);
  });

export default app;
