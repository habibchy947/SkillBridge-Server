import { Request, Response } from "express";
import { categoryServices } from "./category.services";
import { Prisma } from "../../../generated/prisma/client";
import { UserRole } from "../../middlewares/auth";

// post category
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

// get all category by admin
const getAllCategoryByAdmin = async (req: Request, res: Response) => {
  try {
    const result = await categoryServices.getAllCategoryByAdmin();
    return res.status(200).json({
      success: true,
      message: "Category Fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Category Fetched Failed",
      details: error,
    });
  }
};

// get all category 
const getAllCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryServices.getAllCategory();
    return res.status(200).json({
      success: true,
      message: "Category Fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Category Fetched Failed",
      details: error,
    });
  }
};

// update category
const updateCategory = async (req: Request, res: Response) => {
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

    const {cate_id} = req.params
    const result = await categoryServices.updateCategory(req.body, cate_id as string);
    return res.status(200).json({
      success: true,
      message: "Category Updated successfully",
      data: result,
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Failed to update category"
    return res.status(400).json({
      success: false,
      message: errorMessage,
      details: error,
    });
  }
};

// delete category
const deleteCategory = async (req: Request, res: Response) => {
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

    const {cate_id} = req.params
    const result = await categoryServices.deleteCategory(cate_id as string);
    return res.status(200).json({
      success: true,
      message: "Category Deleted successfully",
      data: result,
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Failed to delete category"
    return res.status(400).json({
      success: false,
      message: errorMessage,
      details: error,
    });
  }
};

export const categoryController = {
  createCategory,
  getAllCategoryByAdmin,
  getAllCategory,
  updateCategory,
  deleteCategory
};
