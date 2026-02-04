import { Request, Response } from "express";
import { categoryServices } from "./category.services";
import { Prisma } from "../../../generated/prisma/client";
import { UserRole } from "../../middlewares/auth";

const createCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized ",
      });
    } else if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const result = await categoryServices.createCategory(req.body);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Category is already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Category Creation Failed",
      details: error,
    });
  }
};

export const categoryController = {
  createCategory,
};
