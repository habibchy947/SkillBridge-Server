import express, { Application } from "express";
import { categoryRouter } from "./modules/category/category.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: Application = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/categories", categoryRouter);

app.get("/", (req, res) => {
    res.send("Hello Next Level Web Developer")
})

export default app;