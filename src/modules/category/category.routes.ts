import express, { Router } from "express";
import { categoryController } from "./category.controller";
import auth, { UserRole } from "../../middlewares/auth";
// import { UserRole } from "../../../generated/prisma/enums";


const router = express.Router();


router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);

export const categoryRouter: Router = router;