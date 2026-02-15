import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { reviewsController } from "./review.controller";

const router = express.Router();

router.post("/:bookingId", auth(UserRole.STUDENT), reviewsController.createReview);

export const reviewsRouter: Router = router;