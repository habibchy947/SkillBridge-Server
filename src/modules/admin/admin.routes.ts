import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

export const adminRouter: Router = router;