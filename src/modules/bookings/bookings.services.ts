import { Prisma } from "../../../generated/prisma/client";
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
        const bookingDataAsTutor = await prisma.tutor.findFirst({
            where: {
                userId: id
            }
        })
        if (!bookingDataAsTutor) throw new Error("No booking found for this tutor")
        const bookingData = await prisma.booking.findFirst({
            where: {
                OR: [
                    { studentId: id },
                    { tutorId: bookingDataAsTutor.id },
                ]
            }
        })
        if (!bookingData) throw new Error("booking not found")

        const andConditions: BookingWhereInput[] = []

        if (status) {
            andConditions.push({ status });
        };

        const whereCondition: BookingWhereInput = {
            OR: [
                { studentId: id },
                { tutorId: bookingDataAsTutor.id },
            ],
            AND: andConditions
        };

        const booking = await prisma.booking.findMany({
            skip,
            take: limit,
            orderBy: [
                { [sortBy]: sortOrder },
                { sessionTime: "asc" }
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
        if (role === UserRole.STUDENT) {
            const bookingDataStudent = await prisma.booking.findFirst({
                where: {
                    id: bookingId,
                    studentId: userId
                }
            })
            if (!bookingDataStudent) throw new Error("booking not found for this student")
        }
        const bookingData = await prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        })
        if (!bookingData) throw new Error("booking not found")

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

const updateBookingStatus = async (bookingId: string, status: BookingStatus, userId: string, role: UserRole) => {
    try {
        const bookingStatus = await prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        });
        if (!bookingStatus) throw new Error("Booking not found")

        const bookingDataAsTutor = await prisma.tutor.findFirst({
            where: {
                userId: userId
            }
        })
        if (!bookingDataAsTutor && role === UserRole.TUTOR) throw new Error("You are not authorized to update this booking")
        const isStudent = role === UserRole.STUDENT && bookingStatus.studentId === userId;
        const isTutor = role === UserRole.TUTOR && bookingDataAsTutor && bookingStatus.tutorId === bookingDataAsTutor.id;

        if (bookingStatus.studentId !== userId && role === UserRole.STUDENT) throw new Error("You are not authorized to update this booking")

        if (!isStudent && !isTutor) {
            throw new Error("You are not authorized to update this booking")
        }

        if (bookingStatus.status === BookingStatus.CANCELLED) {
            throw new Error("Booking is already cancelled")
        }

        if (bookingStatus.status === BookingStatus.COMPLETED) {
            throw new Error("Booking is already completed")
        }

        if (status === BookingStatus.CANCELLED) {
            if (bookingStatus.status !== BookingStatus.CONFIRMED) {
                throw new Error("Only confirmed booking can be cancelled")
            }
        }

        if (status === BookingStatus.COMPLETED) {
            if (bookingStatus.status !== BookingStatus.CONFIRMED) {
                throw new Error("Only confirmed booking can be marked as completed")
            }
        }

        if (!isStudent && status === BookingStatus.CANCELLED) {
            throw new Error("Only students can cancel the booking")
        }

        if (!isTutor && status === BookingStatus.COMPLETED) {
            throw new Error("Only tutors can mark the booking as completed")
        }

        if (new Date(bookingStatus.sessionTime) < new Date()) {
            throw new Error("Cannot update past bookings")
        }

        if (new Date(bookingStatus.sessionTime) > new Date() && status === BookingStatus.COMPLETED) {
            throw new Error("Cannot mark future bookings as completed")
        }

        if (bookingStatus.status === status) {
            throw new Error(`Booking is already ${status.toLowerCase()}`)
        }

        const result = await prisma.booking.update({
            where: {
                id: bookingId
            },
            data: { status },
        });

        return result;

    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update booking status!");
    }

};

export const bookingService = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getMyBookings,
    updateBookingStatus
};