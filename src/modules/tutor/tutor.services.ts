import { prisma } from "../../lib/prisma";

type TutorProfileInput = {
  bio: string;
  hourlyRate: number;
  subject: string[];
};

const upsertProfile = async (payload: TutorProfileInput, id: string) => {
    try {
        const existingProfile = await prisma.tutor.findUnique({
        where: {
            userId: id
        }
        })
        
        if (payload.subject && payload.subject.length > 0) {
            const validCategories = await prisma.category.findMany({
                where: {
                    name: {
                    in: payload.subject,
                    },
                },
            select: { name: true },
        });

        if(validCategories) {
            
        }
            const profile = await prisma.tutor.upsert({
                where: {
                    userId: id
                },
                update: payload,
                create: {
                    ...payload,
                    userId: id
                }
            })

            return {
                profile,
                isUpdated: !!existingProfile
            }
        }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to upsert tutor profile");
    }
};


export const tutorServices = {
    upsertProfile
};