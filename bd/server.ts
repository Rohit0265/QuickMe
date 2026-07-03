import crypto from "crypto";
if (!globalThis.crypto) {
    globalThis.crypto = crypto as any;
}
import http from "http";
import path from "path";
import { Server } from "socket.io";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import connectDB from "./database/userDatabase";
import userRouter from "./routes/user.routes";
import connectCloudinay from "./database/cloudinary";
import uploadRouter from "./routes/upload.routes";
import messageRouter from "./routes/message.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    }
});

// Store socket io instance in app context for controllers
app.set("io", io);

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
}));

// Connect database
connectDB();
connectCloudinay();
app.use(express.json());
app.use(clerkMiddleware());
app.use(authMiddleware);

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log(`[Socket] A user connected: ${socket.id}`);

    // Join room based on MongoDB user ID
    socket.on("join", (userId: string) => {
        if (userId) {
            socket.join(userId);
            console.log(`[Socket] User ${userId} joined room ${userId}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
    });
});

// Serve frontend build static files
const distPath = path.join(__dirname, "../fd/dist");
app.use(express.static(distPath));

// Routes
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/messages", messageRouter);

// Fallback: serve index.html for client-side routing
app.get("*splat", (req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }
    res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
            res.status(500).send("Index file not found.");
        }
    });
});

server.listen(8080, () => {
    console.log("Server is running on port 8080");
});