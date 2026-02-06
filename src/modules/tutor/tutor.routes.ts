import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { tutorController } from "./tutor.controller";

const router = express.Router();

router.put("/profile", auth(UserRole.TUTOR), tutorController.upsertProfile);

export const tutorRouter: Router = router;