import { TutorWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AvailabilitySlotInput, CreateTutorProfileInput, UpdateAvailabilitySlotInput, UpdateTutorProfileInput } from "./tutor.types";

// create tutor profile
const createTutorProfile = async (payload: CreateTutorProfileInput, id: string) => {
    try {
        const existingProfile = await prisma.tutor.findUnique({
            where: {
                userId: id
            }
        });

        if (existingProfile) {
            throw new Error("Profile is already exists")
        }
        if (!Array.isArray(payload.categoryIds) || payload.categoryIds.length === 0) {
            throw new Error("At least one category must be selected");
        }

        const profile = await prisma.tutor.create({
            data: {
                userId: id,
                bio: payload.bio,
                hourlyRate: payload.hourlyRate,
                categories: {
                    connect: payload.categoryIds?.map((id) => ({ id })) || []
                }
            },
            include: {
                categories: true,
                user: true
            }
        })

        return profile;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create tutor profile");
    }
};
// get all tutors
const getAllTutors = async ({
    minRate,
    maxRate,
    minRating,
    category,
    search,
    page,
    limit,
    skip,
    sortOrder,
    sortBy
}
    :
    {
        minRate: number | undefined,
        maxRate: number | undefined,
        minRating: number | undefined,
        category: string | undefined,
        search: string | undefined,
        page: number,
        limit: number,
        skip: number,
        sortOrder: string,
        sortBy: string
    }) => {
    try {

        const andConditions: TutorWhereInput[] = []

        const parsedMinRate = minRate !== undefined ? Number(minRate) : undefined;
        const parsedMaxRate = maxRate !== undefined ? Number(maxRate) : undefined;

        if (parsedMinRate !== undefined || parsedMaxRate !== undefined) {
            andConditions.push({
                hourlyRate: {
                    ...(parsedMinRate !== undefined && { gte: parsedMinRate }),
                    ...(parsedMaxRate !== undefined && { lte: parsedMaxRate }),
                },
            });
        }

        if (minRating) {
            andConditions.push({
                rating: {
                    gte: Number(minRating),
                }
            })
        }

        if (category) {
            andConditions.push({
                categories: {
                    some: {
                        name: {
                            equals: category,
                            mode: "insensitive"
                        }
                    }
                }
            })
        }

        if (search) {
            andConditions.push({
                OR: [
                    {
                        categories: {
                            some: {
                                name: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            }
                        },
                    },
                    {
                        bio: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        user: {
                            name: {
                                contains: search,
                                mode: "insensitive"
                            },
                        }
                    }
                ]
            })
        }
        const result = await prisma.tutor.findMany({
            take: limit,
            skip,
            where: {
                AND: andConditions
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                categories: true,
                reviews: true,
            },
            orderBy: {
                [sortBy]: sortOrder,
            }
        })

        const total = await prisma.tutor.count({
            where: {
                AND: andConditions
            }
        });
        return {
            data: result,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch tutors");
    }
}
// get single tutor
const getSingleTutor = async (tutorId: string) => {
    try {
        const tutorData = await prisma.tutor.findUnique({
            where: {
                id: tutorId
            },
            select: { id: true }
        })
        if (!tutorData) throw new Error("Tutor not found");

        const tutor = await prisma.tutor.findUnique({
            where: {
                id: tutorId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                reviews: true,
                bookings: true,
                availabiltySlots: {
                    select: {
                        id: true,
                        tutorId: true,
                        day: true,
                        startTime: true,
                        endTime: true,
                    }
                }
            }
        })
        return tutor;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch tutor");
    }
}
// update tutor profile
const updateTutorProfile = async (payload: UpdateTutorProfileInput, id: string) => {
    try {
        const existingProfile = await prisma.tutor.findUnique({
            where: {
                userId: id
            }
        });

        if (!existingProfile) {
            throw new Error("Profile is not exists in the db")
        }

        const updatedProfile = await prisma.tutor.update({
            where: {
                userId: id
            },
            data: {
                bio: payload.bio ?? existingProfile.bio,
                hourlyRate: payload.hourlyRate ?? existingProfile.hourlyRate,
                ...(payload.categoryIds && {
                    categories: {
                        connect: payload.categoryIds.map((id) => ({ id })),
                    },
                }),
            },
            include: {
                categories: true,
                user: true,

            }
        })

        return updatedProfile;

    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update tutor profile");
    }
}
// create tutor availability
const addAvailability = async (payload: AvailabilitySlotInput, id: string) => {
    try {
        const tutorData = await prisma.tutor.findUnique({
            where: {
                userId: id
            },
            select: {
                id: true
            }
        });

        if (!tutorData) {
            throw new Error("Tutor profile does not exist")
        }
        const existingSlot = await prisma.availability.findFirst({
            where: {
                tutorId: tutorData.id,
                day: payload.day,
                startTime: payload.startTime,
                endTime: payload.endTime,
            }
        })
        if (existingSlot) {
            throw new Error("This availability slot already exists")
        }
        const availability = await prisma.availability.create({
            data: {
                tutorId: tutorData.id,
                day: payload.day,
                startTime: payload.startTime,
                endTime: payload.endTime,
            },
        })

        return availability;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to add availability");
    }
};
// update tutor availability
const updateAvailability = async (payload: UpdateAvailabilitySlotInput, id: string, availabilityId: string) => {
    try {
        const tutorData = await prisma.tutor.findUnique({
            where: {
                userId: id
            },
            select: {
                id: true
            }
        });

        if (!tutorData) {
            throw new Error("Tutor profile does not exist")
        }
        const existingSlot = await prisma.availability.findFirst({
            where: {
                tutorId: tutorData.id,
                id: availabilityId
            }
        })
        if (!existingSlot) {
            throw new Error("Availability slot does not exist")
        }
        const updatedSlot = await prisma.availability.update({
            where: {
                id: availabilityId
            },
            data: {
                day: payload.day ?? existingSlot.day,
                startTime: payload.startTime ?? existingSlot.startTime,
                endTime: payload.endTime ?? existingSlot.endTime,
            }
        })

        return updatedSlot;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update availability slot");
    }
};

export const tutorServices = {
    createTutorProfile,
    updateTutorProfile,
    addAvailability,
    updateAvailability,
    getAllTutors,
    getSingleTutor
};