import { Request, Response } from "express";
import { UserRole } from "../../middlewares/auth";
import { tutorServices } from "./tutor.services";
import { Prisma } from "../../../generated/prisma/client";

const upsertProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(403).json({success: false,message: "Not authenticated",});
    if (req.user.role !== UserRole.TUTOR) return res.status(403).json({success: false, message: "Forbidden"});
    
    const allowedFields = ["bio", "hourlyRate","subject"];
    // invalid fields check
        const invalidFields = Object.keys(req.body).filter(
            (key) => !allowedFields.includes(key)
        );

        // error if invalid fields are present
        if (invalidFields.length) {
          return res.status(400).json({
            success: false,
            message: "Invalid fields in request",
            invalidFields,
          });
        }
    const { profile, isUpdated } = await tutorServices.upsertProfile(req.body, req.user.id);
    return res.status(isUpdated ? 200 : 201).json({
      success: true,
      message: isUpdated ? "Profile updated successfully" : "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Tutor profile already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to saved tutor profile",
      details: error,
    });
  }
};

export const tutorController = {
    upsertProfile
};