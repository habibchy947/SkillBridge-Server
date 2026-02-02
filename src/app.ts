import express, { Application } from "express";
import { categoryRouter } from "./modules/category/category.routes";

const app: Application = express();

app.use(express.json());

app.use("/api/categories", categoryRouter);

app.get("/", (req, res) => {
    res.send("Hello Next Level Web Developer")
})

export default app;