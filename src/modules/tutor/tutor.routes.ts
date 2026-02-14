import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { tutorController } from "./tutor.controller";

const router = express.Router();

// get all tutors
router.get("/", tutorController.getAllTutors)
// get single tutor
router.get("/:id", tutorController.getSingleTutor)
// create tutor profile
router.post("/", auth(UserRole.TUTOR), tutorController.createTutorProfile);
// update tutor profile
router.patch("/profile", auth(UserRole.TUTOR), tutorController.updateTutorProfile);
// get tutor availability
router.get("/availability/:tutorId/slots", auth(UserRole.STUDENT), tutorController.getTutorAvailabilitySlots);
// create tutor availability
router.post("/availability", auth(UserRole.TUTOR), tutorController.addAvailability);
// update tutor availability
router.put("/availability/:id", auth(UserRole.TUTOR), tutorController.updateAvailability);

export const tutorRouter: Router = router;