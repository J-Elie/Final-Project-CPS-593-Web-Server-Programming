// ============================================================================
// IMPORTS
// ============================================================================
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
import { requireAuth } from "../Middleware/auth";

// ============================================================================
// ROUTER
// ============================================================================
const app = Router();

app
  // --------------------------------------------------------------------------
  // GET /api/v1/posts
  // Returns a paginated, searchable list of all posts.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/", requireAuth(), async (req, res) => {
    const { posts, count } = await getAll(req.query);
    const response: DataListEnvelope<Post> = {
      data: posts,
      isSuccess: true,
      total: count,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/posts/count
  // Returns the total number of posts.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/count", requireAuth(), async (req, res) => {
    const { count } = await getAll(req.query);
    const response: DataEnvelope<{ count: number }> = {
      data: { count },
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/posts/user/:userId
  // Returns all posts belonging to a specific user.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/user/:userId", requireAuth(), async (req, res) => {
    const { userId } = req.params;
    const posts = await getByUserId(Number(userId));
    const response: DataListEnvelope<Post> = {
      data: posts,
      isSuccess: true,
      total: posts.length,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/posts/:id
  // Returns a single post by ID.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/:id", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const response: DataEnvelope<Post> = {
      data: await get(Number(id)),
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // POST /api/v1/posts
  // Creates a new post.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .post("/", requireAuth(), async (req, res) => {
    const newPost = await create(req.body);
    const response: DataEnvelope<Post> = {
      data: newPost,
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // PATCH /api/v1/posts/:id
  // Partially updates a post by ID.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .patch("/:id", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const updatedPost = await update(Number(id), req.body);
    const response: DataEnvelope<Post> = {
      data: updatedPost as Post,
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // DELETE /api/v1/posts/:id
  // Deletes a post by ID.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .delete("/:id", requireAuth(), async (req, res) => {
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
