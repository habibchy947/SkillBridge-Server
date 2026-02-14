import { BookingStatus } from "../../../generated/prisma/enums";
import { BookingWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";
import type { createBookings } from "./bookings.types";

// create Booking
const createBooking = async (studentId: string, payload: createBookings) => {
    console.log(studentId, payload.sessionTime, payload.availabilityId)
    try {
        const availability = await prisma.availability.findUnique({
            where: { id: payload.availabilityId }
        })

        if (!availability) throw new Error("Availability not found.")

        const tutorData = await prisma.tutor.findUnique({
            where: { id: availability.tutorId }
        })
        if (!tutorData) throw new Error("Tutor not found.")

        const existingBooking = await prisma.booking.findFirst({
            where: {
                availabilityId: payload.availabilityId,
                sessionTime: new Date(payload.sessionTime)
            }
        })

        if (existingBooking) throw new Error("Slot already booked.")

        //calculate price
        const calculatePrice = (
            startTime: string,
            endTime: string,
            hourlyRate: number
        ) => {
            const toMinutes = (time: string) => {
                const [h, m] = time.split(":").map(Number) as [number, number];
                return h * 60 + m;
            };

            const start = toMinutes(startTime);
            const end = toMinutes(endTime);

            if (end <= start) {
                throw new Error("Invalid session time");
            }

            const duration = end - start;

            return Math.round((hourlyRate / 60) * duration);
        };
        const price = calculatePrice(availability.startTime, availability.endTime, tutorData.hourlyRate);

        const booking = await prisma.booking.create({
            data: {
                studentId,
                tutorId: availability.tutorId,
                availabilityId: payload.availabilityId,
                sessionTime: new Date(payload.sessionTime),
                price,
            }
        })

        return booking;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create booking!");
    }
};

// get all Booking
const getAllBookings = async ({
    status,
    page,
    limit,
    skip,
    sortOrder,
    sortBy
}: {
    status?: BookingStatus | undefined;
    page: number;
    limit: number;
    skip: number;
    sortOrder: string;
    sortBy: string;
}) => {
    try {
        const andConditions: BookingWhereInput[] = []

        if (status) {
            andConditions.push({ status });
        }

        const booking = await prisma.booking.findMany({
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            where: {
                AND: andConditions
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                reviews: true,
                tutor: {
                    select: {
                        hourlyRate: true,
                        rating: true,
                    }
                }
            }
        })
        const total = await prisma.booking.count({
            where: {
                AND: andConditions
            }
        })
        return {
            data: booking,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get all bookings!");
    }
};

// get my Booking
const getMyBookings = async (
    {
    id,
    status,
    page,
    limit,
    skip,
    sortOrder,
    sortBy
}: {
    id: string;
    status?: BookingStatus | undefined;
    page: number;
    limit: number;
    skip: number;
    sortOrder: string;
    sortBy: string;
}) => {
    try {
        const bookingData = await prisma.booking.findFirst({
            where: {
                studentId: id
            }
        })
        if(!bookingData) throw new Error("booking not found")
            
        const andConditions: BookingWhereInput[] = []

        if (status) {
            andConditions.push({ status });
        };

        const whereCondition: BookingWhereInput = {
            studentId: id,
            AND: andConditions
        };

        const booking = await prisma.booking.findMany({
            skip,
            take: limit,
            orderBy: [
                {[sortBy]: sortOrder},
                {sessionTime: "asc"}
            ],
            where: whereCondition,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                reviews: true,
                tutor: {
                    select: {
                        hourlyRate: true,
                        rating: true,
                    }
                },
                availability: true
            }
        })
        const total = await prisma.booking.count({
            where: whereCondition
        })
        return {
            data: booking,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get all bookings!");
    }
};

// getSingleBooking
const getSingleBooking = async (bookingId: string, userId: string, role: UserRole) => {
    try {
        if(role === UserRole.STUDENT) {
            const bookingDataStudent = await prisma.booking.findFirst({
                where: { 
                    id: bookingId,
                    studentId: userId
                }
            })
            if(!bookingDataStudent) throw new Error("booking not found for this student")
        }
        const bookingData = await prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        })
        if(!bookingData) throw new Error("booking not found")

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                reviews: true,
                tutor: {
                    select: {
                        hourlyRate: true,
                        rating: true,
                    }
                }
            }
        })
        return booking;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get this booking!");
    }
};

export const bookingService = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getMyBookings
};