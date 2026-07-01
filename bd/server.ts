import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./database/userDatabase";
import userRouter from "./routes/user.routes";

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

// Connect database
connectDB();

// Routes
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
    res.statusCode = 200;
    res.send("OK!");
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});