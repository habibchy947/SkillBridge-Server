import { Request, Response } from "express";
import { categoryServices } from "./category.services";

const createCategory = async (req: Request, res: Response ) => {
    try {
        const result = await categoryServices.createCategory(req.body);
        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Category Creation Failed",
            details: error
        });
    };
};

export const categoryController = {
    createCategory,
};