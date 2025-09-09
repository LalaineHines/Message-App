import express from "express";
import { sendFriendRequest, respondToFriendRequest, getPendingFriendRequests, deleteFriend, getFriendsList, searchByFriendCode } form "../controllers/friendController";
import { protectRoute } from "../middleware/auth";

const friendRouter = express.Router();

// Send friend request
friendRouter.post("/request", protectRoute, sendFriendRequest);
friendRouter.post("/respond", protectRoute, respondToFriendRequest);
friendRouter.get("/requests", protectRoute, getPendingFriendRequests);
friendRouter.delete("/:friendId", protectRoute, deleteFriend);
friendRouter.get("/", protectRoute, getFriendsList);
friendRouter.post("/search", protectRoute, searchByFriendCode);

export default friendRouter;