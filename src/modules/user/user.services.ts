import { User } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const updateOwnProfile = async (id: string, data: User) => {
    try {
        await prisma.user.findUniqueOrThrow({
        where: {
            id
        },
        select: {
            id: true,
        }
    });

    const result = await prisma.user.update({
        where: {
            id
        },
        data
    });

    return result;

    } catch (error) {
        throw new Error("Failed to update profile");
    }

};

export const userServices = {
    updateOwnProfile
}