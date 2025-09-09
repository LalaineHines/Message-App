import express from "express";
import { checkAuth, login, signup, updateProfile } from "../controllers/userController";
import { protectRoute } from "../middleware/auth";
import paaport from "passport";
import { generateToken } from "../lib/utils";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/updateProfile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

userRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?oauth=failed` }),
    (req, res) => {
        // @ts-ignore
        const userId = req.user_id.toString();
        const token = generateToken(userId);

        const redirectUrl = `${process..env.FRONTEND_URL}/home?token=${encodedURIComponent(token)}`;
        res.redirect(redirectUrl);
    }
);

export default userRouter;