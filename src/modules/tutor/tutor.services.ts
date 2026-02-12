import { prisma } from "../../lib/prisma";
import { AvailabilitySlotInput, CreateTutorProfileInput, UpdateTutorProfileInput } from "./tutor.types";


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

const addAvailability = async (payload: AvailabilitySlotInput , id: string) => {
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

export const tutorServices = {
    createTutorProfile,
    updateTutorProfile,
    addAvailability
};