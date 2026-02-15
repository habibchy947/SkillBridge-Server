import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { bookingController } from "./bookings.controller";

const router = express.Router();

router.post("/", auth(UserRole.STUDENT), bookingController.createBooking);

router.get("/admin", auth(UserRole.ADMIN), bookingController.getAllBookings);

router.get("/single/:id", auth(UserRole.STUDENT, UserRole.ADMIN), bookingController.getSingleBooking);

router.get("/myBookings", auth(UserRole.STUDENT, UserRole.TUTOR), bookingController.getMyBookings);

router.patch("/:id/status", auth(UserRole.STUDENT, UserRole.TUTOR), bookingController.updateBookingStatus);
export const bookingsRouter: Router = router;