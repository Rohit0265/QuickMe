import express from "express";
import "dotenv/config";
import connectDB from "./database/userDatabase";

const app = express();

connectDB();

app.get("/", (req, res) => {
    res.statusCode = 200;
    res.send("OK!");
});





app.listen(8080, () => {
    console.log("Server is running on port 8080");
});