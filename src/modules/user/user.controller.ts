import { Request, Response } from "express";
import { userServices } from "./user.services";

const updateOwnProfile = async (req: Request, res: Response) => {
  try {
    const allowedFields = ["name", "image", "email"];
        // check if req.user is present
        if (!req.user) {
              return res.status(403).json({
                success: false,
                message: "Unauthorized Access",
              });
            }

        const { id } = req.params;
        // id is required
        if(!id) {
          return res.status(401).json({
          success: false,
          message: "User id is required!",
        });
        }

        // user can only update their own profile
        if(req.user.id !== id) {
          return res.status(403).json({
          success: false,
          message: "Unauthorized Access",
        });
        }

        if (!req.body ||typeof req.body !== "object" || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update",
            });
        }

        if(req.body.hasOwnProperty("status")) {
          return res.status(403).json({
          success: false,
          message: "Status field can't be updated",
        });
        }

        // invalid fields check
        const invalidFields = Object.keys(req.body).filter(
            (key) => !allowedFields.includes(key)
        );

        if (invalidFields.length) {
          return res.status(400).json({
            success: false,
            message: "Invalid fields in request",
            invalidFields,
          });
        }

        const result = await userServices.updateOwnProfile(id as string, req.body);
        return res.status(200).json({
          success: true,
          message: "Your profile updated.",
          data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Failed to Update your profile",
      details: error,
    });
  }
};

export const userController = {
    updateOwnProfile
}