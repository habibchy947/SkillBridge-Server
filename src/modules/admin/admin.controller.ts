import { Request, Response } from "express";
import { adminServices } from "./admin.services";
import { UserRole } from "../../middlewares/auth";

const getAllUsers = async (req: Request, res: Response) => {
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
        const result = await adminServices.getAllUsers()
        return res.status(200).json({
          success: true,
          message: "Users Fetched successfully",
          data: result,
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Failed to fetched users.",
          details: error,
        });
      }
};

export const adminController = {
    getAllUsers
}