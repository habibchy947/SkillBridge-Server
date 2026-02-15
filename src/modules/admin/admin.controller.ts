import { Request, Response } from "express";
import { adminServices } from "./admin.services";
import { UserRole } from "../../middlewares/auth";
import { UserStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    // if (!req.user) {
    //       return res.status(403).json({
    //         success: false,
    //         message: "Unauthorized ",
    //       });
    //     } else if (req.user.role !== UserRole.ADMIN) {
    //       return res.status(403).json({
    //         success: false,
    //         message: "Unauthorized Access",
    //       });
    //     }

    const status = req.query.status as UserStatus | undefined;
    const role = req.query.role as UserRole | undefined;

    const { page, limit, skip, sortOrder, sortBy } = paginationSortingHelper(req.query);

    const result = await adminServices.getAllUsers({ status, role, page, limit, skip, sortOrder, sortBy })
    return res.status(200).json({
      success: true,
      message: "Users Fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Failed to fetched users.",
    });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  try {
    // if (!req.user) {
    //       return res.status(403).json({
    //         success: false,
    //         message: "Unauthorized ",
    //       });
    //     } else if (req.user.role !== UserRole.ADMIN) {
    //       return res.status(403).json({
    //         success: false,
    //         message: "Unauthorized Access",
    //       });
    //     }
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "User id is required!",
      });
    }

    const { status } = req.body as { status: UserStatus };
    if (status !== UserStatus.ACTIVE && status !== UserStatus.BANNED) {
      return res.status(401).json({
        success: false,
        message: "Invalid Status",
      });
    }

    if (req.body === "name" || "email" || "role" || "image" || "emailVerified") {
      return res.status(403).json({
        success: false,
        message: "Only status field can be updated",
      });
    }

    const result = await adminServices.updateUserStatus(id as string, status)
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Failed to Update user status.",
      details: error,
    });
  }
};

const getStatistics = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.getStatistics();
    return res.status(200).json({
      success: true,
      message: "Statistics fetched successfully",
      data: result,
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Failed to fetch statistics!"
        res.status(400).json({
            error: errorMessage,
            details: error
        })
  }
}



export const adminController = {
  getAllUsers,
  updateUserStatus,
  getStatistics
}