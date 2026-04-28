// ============================================================================
// IMPORTS
// ============================================================================
import { Router } from "express";
import {
  getAll,
  get,
  create,
  update,
  remove,
  follow,
  unfollow,
  getFollowing,
  getFollowers,
  login,
} from "../Models/users";
import { User, DataEnvelope, DataListEnvelope } from "../Types/users";
import { requireAuth } from "../Middleware/auth";

// ============================================================================
// ROUTER
// ============================================================================
const app = Router();

app
  // --------------------------------------------------------------------------
  // GET /api/v1/users
  // Returns a paginated, searchable list of all users.
  // Admin only.
  // --------------------------------------------------------------------------
  .get("/", requireAuth("admin"), async (req, res) => {
    const { list, count } = await getAll(req.query);
    const sanitizedUsers = list.map((x) => ({
      ...x,
      password: undefined,
    }));
    const response: DataListEnvelope<User> = {
      data: sanitizedUsers,
      isSuccess: true,
      total: count,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/users/count
  // Returns the total number of users.
  // Admin only.
  // --------------------------------------------------------------------------
  .get("/count", requireAuth("admin"), async (req, res) => {
    const { count } = await getAll(req.query);
    const response: DataEnvelope<{ count: number }> = {
      data: { count },
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/users/:id
  // Returns a single user by ID.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/:id", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const response: DataEnvelope<User> = {
      data: await get(Number(id)),
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // POST /api/v1/users/login
  // Authenticates a user by email and returns a JWT token + user object.
  // No auth required (public route).
  // --------------------------------------------------------------------------
  .post("/login", async (req, res) => {
    const { email } = req.body;
    const response: DataEnvelope<{ token: string; user: User }> = {
      data: await login(email),
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // POST /api/v1/users
  // Creates a new user.
  // --------------------------------------------------------------------------
  .post("/", async (req, res) => {
    const newUser = await create(req.body);
    const response: DataEnvelope<User> = {
      data: newUser,
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // PATCH /api/v1/users/:id
  // Partially updates a user by ID.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .patch("/:id", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const updatedUser = await update(Number(id), req.body);
    const response: DataEnvelope<User> = {
      data: updatedUser as User,
      isSuccess: true,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // DELETE /api/v1/users/:id
  // Deletes a user by ID.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .delete("/:id", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const removedUser = await remove(Number(id));
    const response: DataEnvelope<User> = {
      data: removedUser,
      isSuccess: true,
      message: `User ${removedUser.firstName} has been removed.`,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // POST /api/v1/users/:id/follow
  // Follow a user. Body: { followerId: number }
  // Requires authentication.
  // --------------------------------------------------------------------------
  .post("/:id/follow", requireAuth(), async (req, res) => {
    const { id } = req.params; // the user being followed
    const { followerId } = req.body;
    await follow(Number(followerId), Number(id));
    const response: DataEnvelope<null> = { data: null, isSuccess: true };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // DELETE /api/v1/users/:id/follow
  // Unfollow a user. Body: { followerId: number }
  // Requires authentication.
  // --------------------------------------------------------------------------
  .delete("/:id/follow", requireAuth(), async (req, res) => {
    const { id } = req.params; // the user being unfollowed
    const { followerId } = req.body;
    await unfollow(Number(followerId), Number(id));
    const response: DataEnvelope<null> = { data: null, isSuccess: true };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // DELETE /api/v1/users/:id/followers/:followerId
  // Remove a follower — user :id kicks follower :followerId off their list.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .delete("/:id/followers/:followerId", requireAuth(), async (req, res) => {
    const { id, followerId } = req.params;
    await unfollow(Number(followerId), Number(id));
    const response: DataEnvelope<null> = { data: null, isSuccess: true };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/users/:id/following
  // Returns the list of users that user :id is following.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/:id/following", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const list = await getFollowing(Number(id));
    const response: DataListEnvelope<User> = {
      data: list,
      isSuccess: true,
      total: list.length,
    };
    res.send(response);
  })

  // --------------------------------------------------------------------------
  // GET /api/v1/users/:id/followers
  // Returns the list of users who follow user :id.
  // Requires authentication.
  // --------------------------------------------------------------------------
  .get("/:id/followers", requireAuth(), async (req, res) => {
    const { id } = req.params;
    const list = await getFollowers(Number(id));
    const response: DataListEnvelope<User> = {
      data: list,
      isSuccess: true,
      total: list.length,
    };
    res.send(response);
  });

export default app;
