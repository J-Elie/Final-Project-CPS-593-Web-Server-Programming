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
} from "../Models/users";
import { User, DataEnvelope, DataListEnvelope } from "../Types/users";

const app = Router();

app
  .get("/", async (req, res) => {
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
  .get("/count", async (req, res) => {
    const { count } = await getAll(req.query);
    const response: DataEnvelope<{ count: number }> = {
      data: { count },
      isSuccess: true,
    };
    res.send(response);
  })
  .get("/:id", async (req, res) => {
    const { id } = req.params;
    const response: DataEnvelope<User> = {
      data: await get(Number(id)),
      isSuccess: true,
    };
    res.send(response);
  })

  .post("/", async (req, res) => {
    const newUser = await create(req.body);
    const response: DataEnvelope<User> = {
      data: newUser,
      isSuccess: true,
    };
    res.send(response);
  })
  .patch("/:id", async (req, res) => {
    const { id } = req.params;
    const updatedUser = await update(Number(id), req.body);
    const response: DataEnvelope<User> = {
      data: updatedUser as User,
      isSuccess: true,
    };
    res.send(response);
  })
  .delete("/:id", async (req, res) => {
    const { id } = req.params;
    const removedUser = await remove(Number(id));
    const response: DataEnvelope<User> = {
      data: removedUser,
      isSuccess: true,
      message: `User ${removedUser.firstName} has been removed.`,
    };
    res.send(response);
  })
  .post("/:id/follow", async (req, res) => {
    const { id } = req.params; // the user being followed
    const { followerId } = req.body;
    await follow(Number(followerId), Number(id));
    const response: DataEnvelope<null> = { data: null, isSuccess: true };
    res.send(response);
  })
  .delete("/:id/follow", async (req, res) => {
    const { id } = req.params; // the user being unfollowed
    const { followerId } = req.body;
    await unfollow(Number(followerId), Number(id));
    const response: DataEnvelope<null> = { data: null, isSuccess: true };
    res.send(response);
  })
  // Remove a follower — user :id kicks follower :followerId off their followers list
  .delete("/:id/followers/:followerId", async (req, res) => {
    const { id, followerId } = req.params;
    await unfollow(Number(followerId), Number(id));
    const response: DataEnvelope<null> = { data: null, isSuccess: true };
    res.send(response);
  })
  .get("/:id/following", async (req, res) => {
    const { id } = req.params;
    const list = await getFollowing(Number(id));
    const response: DataListEnvelope<User> = {
      data: list,
      isSuccess: true,
      total: list.length,
    };
    res.send(response);
  })
  .get("/:id/followers", async (req, res) => {
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
