import crypto from "crypto";
if (!globalThis.crypto) {
    globalThis.crypto = crypto as any;
}
import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import connectDB from "./database/userDatabase";
import userRouter from "./routes/user.routes";
import connectCloudinay from "./database/cloudinary";
import uploadRouter from "./routes/upload.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();
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


// Routes




app.get("/", (req, res) => {
    res.statusCode = 200;
    res.send("OK!");
});
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});