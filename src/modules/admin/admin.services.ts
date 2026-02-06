import { UserStatus } from "../../../generated/prisma/enums";
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

    if(status) {
        andConditions.push({
            status
        })
    };

    if(role) {
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
        if(error instanceof Prisma.PrismaClientKnownRequestError) {
            if(error.code === "P2025") {
                throw new Error ("User not found")
            }
        }
    }

};


export const adminServices = {
    getAllUsers,
    updateUserStatus
}