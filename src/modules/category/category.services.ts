import { Category, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

// create category
const createCategory = async (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    const result = await prisma.category.create({
        data
    });
    return result;
};

// get all category by admin
const getAllCategoryByAdmin = async () => {
    const result = await prisma.category.findMany();
    const total = await prisma.category.count();
    return {
        data: result,
        total,
    };
};

// get all category
const getAllCategory = async () => {
    const result = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            description: true
        }
    });
    return {
        data: result,
    };
};

// update category
const updateCategory = async (data: Partial<Category>, cate_id: string) => {
    try {
        await prisma.category.findUniqueOrThrow({
        where: {
            id: cate_id
        },
        select: {
            id: true,
            name: true
        }
    });

    const result = await prisma.category.update({
        where: {
            id: cate_id
        },
        data
    });

    return result;

    } catch (error) {
        if(error instanceof Prisma.PrismaClientKnownRequestError) {
            if(error.code === "P2025") {
                throw new Error ("Category not found")
            }
        }
    }

};

// delete category
const deleteCategory = async (cate_id: string) => {
    try {
        await prisma.category.findUniqueOrThrow({
        where: {
            id: cate_id
        },
        select: {
            id: true,
            name: true
        }
    });

    const result = await prisma.category.delete({
        where: {
            id: cate_id
        }
    });

    return result;

    } catch (error) {
        if(error instanceof Prisma.PrismaClientKnownRequestError) {
            if(error.code === "P2025") {
                throw new Error ("Category not found")
            }
        }
    }

};

export const categoryServices = {
    createCategory,
    getAllCategoryByAdmin,
    getAllCategory,
    updateCategory,
    deleteCategory
};