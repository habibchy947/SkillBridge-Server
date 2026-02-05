import express, { Router } from "express";
import { userController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.patch("/:id", auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR), userController.updateOwnProfile)

export const userRouter: Router = router;