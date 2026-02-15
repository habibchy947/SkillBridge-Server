import express, { Application } from "express";
import { categoryRouter } from "./modules/category/category.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import errorHandler from "./middlewares/globalErrorHandler";
import { adminRouter } from "./modules/admin/admin.routes";
import { userRouter } from "./modules/user/user.routes";
import { tutorRouter } from "./modules/tutor/tutor.routes";
import { bookingsRouter } from "./modules/bookings/bookings.routes";
import { reviewsRouter } from "./modules/reviews/review.routes";

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
}))

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/categories", categoryRouter);

app.use("/api/admin", adminRouter);

app.use("/api/user", userRouter);

app.use("/api/tutors", tutorRouter);

app.use("/api/bookings", bookingsRouter);

app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => {
    res.send("Hello Next Level Web Developer")
})

app.use(errorHandler);

export default app;