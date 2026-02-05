import { prisma } from "../../lib/prisma";

// get all users
const getAllUsers = async () => {
    const result = await prisma.user.findMany();
    const total = await prisma.user.count();
    return {
        data: result,
        total,
    };
};

export const adminServices = {
    getAllUsers
}