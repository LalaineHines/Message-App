import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';


// Middleware to protect routes
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        of (!token) {
            res.status(401).json({ success: false, message: "No token provided" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error("Auth middlewar error:", error.message);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};