import express from "express";

const app = express();


app.get("/", (req, res) => {
    res.statusCode = 200;
    res.send("OK!");
});





app.listen(8080, () => {
    console.log("Server is running on port 8080");
});