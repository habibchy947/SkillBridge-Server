import { prisma } from "../../lib/prisma";

const createReview = async (studentId: string, bookingId: string, rating: number, comment: string) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                studentId: true,
                status: true,
                tutorId: true,
            }
        })
        if(!booking) {
            throw new Error("Booking not found!");
        } else if(booking.tutorId === null) {
            throw new Error("This booking is not assigned to any tutor yet!");
        } else if (booking.studentId !== studentId) {
            throw new Error("You are not allowed to review this booking!");
        } else if(booking.status !== "COMPLETED") {
            throw new Error("You can only review completed sessions!");
        }
        const existingReview = await prisma.review.findFirst({
            where: {
                bookingId: bookingId,
            }
        })
        if(existingReview) {
            throw new Error("You have already reviewed this booking!");
        }
        const tutorId = booking.tutorId;

        const result =  await prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    bookingId,
                    studentId,
                    tutorId,
                    rating,
                    comment,
                }
            });

            const tutor = await tx.tutor.findUnique({
                where: { id: tutorId },
                select: { 
                    rating: true,
                    totalReviews: true,
                }

            })

            if(!tutor) {
                throw new Error("Tutor not found!");
            }


            // const reviews = await tx.review.findMany({
            //     where: {
            //         tutorId,
            //     },
            //     select: { rating: true }
            // })

            const newTotal = tutor.totalReviews + 1;

            const newAverage = (tutor.rating * tutor.totalReviews + rating) / newTotal;

            const roundedAverage = Number(newAverage.toFixed(2)); 
            
            await tx.tutor.update({
                where: { id: tutorId },
                data: {
                    rating: roundedAverage,
                    totalReviews: newTotal
                }
            })

            return review;
        })
        return result;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create review!");
    }
};

export const reviewsServices = {
    createReview
};