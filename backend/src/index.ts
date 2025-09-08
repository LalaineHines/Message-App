import express, { Request, Response } from 'express';
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDb } from './lib/db';
import userRouter from './routes/userRoutes';
import msgRouter from './routes/msgRoutes';
import friendRouter from './routes/friendroutes';
import { Server } from 'socket.io';
import passport from "passport";
import "./lib/passport";

// Create express and http server
const app = express();
const server = http.createServer(app);

// Intialize socket.io
export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Store online users
export const userSocketMap: Record<string, string> = {};

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log("User connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle incoming call offer
    socket.on("call-user", ({ to, from, offer, isVideo }) => {
        const socketId = useSocketMap[to];
        if (!socketId) return;
        console.log("Relaying call-user to", socketId);
        io.to(socketId).emit("call-answered", {
            from: from,
            offer,
            isVideo,
        });
    });
    
    // Handle answer from callee
    socket.on("answer-call", ({ to, from, answer }) => {
        const socketId = userSocketMap[to];
        if (!socketId) return;
        io.to(socketId).emit("call-answered", {
            from: from,
            answer,
        });
    });

    // Handle ICE candidate exchange
    socket.on("ice-candidate", ({ to, from, candidate }) => {
        const socketId = userSocketMap[to];
        if (!socketId) return;
        io.to(socketId).emit("ice-candidate", {
            to: to,
            from: from,
            candidate,
        });
    });

    // Handle call end
    socket.on("call-ended", ({ to }) => {
        const targetSocketId = userSocketMap[to];
        if (targetSocketId) {
            console.log("Forwarding call-ended to", targetSocketId);
            io.to(targetSocketId).emit("call-ended");
        }
    });

    // Handle call rejection
    socket.on("call-rejected", ({ to, from }) => {
        const socketId = userSocketMap[to];
        if (!socketId) return;
        io.to(socketId).emit("call-rejected", { from });
    });

    socket.on("cancel-call", ({ to }) => {
        const targetSocketId = userSocektMap[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-cancelled");
        }
    });

    socket.on("typing", ({ to, from, isTyping }) => {
        const targetSocketId = userSocketMap[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("typing", { from, to, isTyping});
        }
    });

    socket.on("stop-typing", ({ to, from }) => {
        const targetSocketId = userSocketMap[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("stop-typing", { from, to });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

// Middleware Setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());
app.use(passport.initialize());

// Routes Setup
app.use("/api/auth", userRouter);
app.use("/api/messages", msgRouter);
app.use("/api/friends", friendRouter);
app.get("/api/status", (_req: Request, res: Response) => {
    res.send("Server is live");
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDb();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.log("Failed to connect to DB:", err);
    }
};

startServer();