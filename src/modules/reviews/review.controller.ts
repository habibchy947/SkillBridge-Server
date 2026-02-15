import { Request, Response } from "express";
import { reviewsServices } from "./review.services";
import { UserRole } from "../../middlewares/auth";

// create booking
const createReview = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        } else if (req.user.role !== UserRole.STUDENT) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized Access",
            });
        }
        const studentId = req.user.id;
        const { bookingId } = req.params;
        if (!bookingId) return res.status(400).json({ success: false, message: "Booking Id is required!" })

        const { rating, comment } = req.body;
        if (!rating) return res.status(400).json({ success: false, message: "Rating is required!" });
        if (!comment) return res.status(400).json({ success: false, message: "Comment is required!" });

        if (typeof rating !== "number" || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5!" });
        }

        if (typeof comment !== "string" || comment.trim() === "" || comment.length > 300) {
            return res.status(400).json({ success: false, message: "Comment must be a non-empty string with a maximum length of 300 characters!" });
        }

        if(comment.length < 50) {
            return res.status(400).json({ success: false, message: "Comment must be at least 50 characters long!" });
        }
        const result = await reviewsServices.createReview(studentId, bookingId as string, rating, comment);
        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: result,
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Review Creation Failed",
            details: error,
        });
    }
};

export const reviewsController = {
    createReview,
};