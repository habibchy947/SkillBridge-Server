import { BookingStatus, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { UserWhereInput } from "../../../generated/prisma/models";
import { UserRole } from "../../middlewares/auth";
import { Prisma } from "../../../generated/prisma/client";

// get all users
const getAllUsers = async ({
    status,
    role,
    page,
    limit,
    skip,
    sortOrder,
    sortBy
}:
    {
        status: UserStatus | undefined,
        role: UserRole | undefined,
        page: number,
        limit: number,
        skip: number,
        sortOrder: string,
        sortBy: string,
    }
) => {
    const andConditions: UserWhereInput[] = []

    if (status) {
        andConditions.push({
            status
        })
    };

    if (role) {
        andConditions.push({
            role
        })
    };

    const result = await prisma.user.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions
        },
        orderBy: {
            [sortBy]: sortOrder
        },
    });

    const total = await prisma.user.count({
        where: {
            AND: andConditions
        }
    });

    const tutorCount = await prisma.user.count({
        where: {
            role: "TUTOR"
        }
    })

    const studentCount = await prisma.user.count({
        where: {
            role: "STUDENT"
        }
    })

    return {
        data: result,
        tutor: tutorCount,
        student: studentCount,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateUserStatus = async (id: string, data: UserStatus) => {
    try {
        const statusData = await prisma.user.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                status: true
            }
        });

        const result = await prisma.user.update({
            where: {
                id
            },
            data: {
                status: data
            }
        });

        return result;

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new Error("User not found")
            }
        }
    }

};

const getStatistics = async () => {
    try {
        return await prisma.$transaction(async (tx) => {
            const [totalUsers, totalStudent, totalTutor, adminCount, activeUsers, bannedUsers, totalBookings, completedBooking, confirmedBookings, cancelledBookings, totalRevenue, monthlyRevenue, totalReviews, averageRating, topTutor, categories, availabitySlots] =
                await Promise.all([
                    await tx.user.count(),
                    await tx.user.count({ where: { role: UserRole.STUDENT } }),
                    await tx.user.count({ where: { role: UserRole.TUTOR } }),
                    await tx.user.count({ where: { role: UserRole.ADMIN } }),
                    await tx.user.count({ where: { status: UserStatus.ACTIVE } }),
                    await tx.user.count({ where: { status: UserStatus.BANNED } }),
                    await tx.booking.count(),
                    await tx.booking.count({ where: { status: BookingStatus.COMPLETED } }),
                    await tx.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
                    await tx.booking.count({ where: { status: BookingStatus.CANCELLED } }),
                    await tx.booking.aggregate({
                        _sum: { price: true }
                    }),
                    await tx.booking.aggregate({
                        _sum: { price: true },
                        where: {
                            status: BookingStatus.COMPLETED,
                            createdAt: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            }
                        }
                    }),
                    await tx.review.count(),
                    await tx.review.aggregate({
                        _avg: { rating: true }
                    }),
                    await tx.tutor.findMany({
                        take: 5,
                        orderBy: { rating: "desc" },
                        select: {
                            id: true,
                            rating: true,
                            totalReviews: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true
                                },
                            },
                        },
                    }),
                    await tx.category.findMany({
                        select: {
                            id: true, 
                            name: true,
                            _count: true
                        },
                    }),
                    await tx.availability.count(),
                ])

            return {
                users: {
                    totalUsers,
                    totalStudent,
                    totalTutor,
                    adminCount,
                    activeUsers,
                    bannedUsers,
                },
                bookings: {
                    totalBookings,
                    completedBooking,
                    confirmedBookings,
                    cancelledBookings,
                },
                revenue: {
                    totalRevenue: totalRevenue._sum.price || 0,
                    monthlyRevenue: monthlyRevenue._sum.price || 0,
                },
                reviews: {
                    totalReviews,
                    averageRating: Number(
                        (averageRating._avg.rating || 0).toFixed(2)
                    ),
                },
                topTutor,
                categories: categories.map(category => ({
                    id: category.id,
                    name: category.name,
                    totalTutors: category._count.tutors
                })),
                availabitySlots

            }
        })
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch statistics!")
    }
}

export const adminServices = {
    getAllUsers,
    updateUserStatus,
    getStatistics
}