import express, { Application } from "express";

const app: Application = express();

app.get("/", (req, res) => {
    res.send("Hello Next Level Web Developer")
})

export default app;