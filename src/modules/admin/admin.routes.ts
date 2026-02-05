import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

router.patch("/users/status/:id", auth(UserRole.ADMIN), adminController.updateUserStatus);


export const adminRouter: Router = router;