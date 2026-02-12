import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { tutorController } from "./tutor.controller";

const router = express.Router();

router.post("/", auth(UserRole.TUTOR), tutorController.createTutorProfile);

router.patch("/profile", auth(UserRole.TUTOR), tutorController.updateTutorProfile);

router.post("/availability", auth(UserRole.TUTOR), tutorController.addAvailability);

export const tutorRouter: Router = router;