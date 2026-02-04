import express, { Router } from "express";
import { categoryController } from "./category.controller";

const router = express.Router();

router.post("/", categoryController.createCategory);

router.get("/id", categoryController.createCategory);

export const categoryRouter: Router = router;