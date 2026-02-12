import { Request, Response } from "express";
import { tutorServices } from "./tutor.services";
import { Prisma } from "../../../generated/prisma/client";
import { UserRole } from "../../middlewares/auth";

const createTutorProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(403).json({ success: false, message: "Not authenticated", });
    if (req.user.role !== UserRole.TUTOR) { return res.status(403).json({ success: false, message: "Only tutors can create tutor profiles", }); }
    if (!req.body) return res.status(400).json({ success: false, message: "provide required fields to create profile" })

    const allowedFields = ["bio", "hourlyRate", "categoryIds"];

    const missingFields = allowedFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) return res.status(400).json({ success: false, message: "Missing required fields", missingFields, });

    // invalid fields check
    const invalidFields = Object.keys(req.body).filter((key) => !allowedFields.includes(key));

    // error if invalid fields are present
    if (invalidFields.length) return res.status(400).json({ success: false, message: "Invalid fields in request", invalidFields, }); 

    if (req.body.categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category must be selected",
      });
    }

    const result = await tutorServices.createTutorProfile(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result,
    });
  } catch (error:any) {
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
      message: error.message,
    });
  }
};

const updateTutorProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(403).json({ success: false, message: "Not authenticated", });
    if (req.user.role !== UserRole.TUTOR) { return res.status(403).json({ success: false, message: "Only tutors can update tutor profiles", }); }
    if (!req.body) return res.status(400).json({ success: false, message: "provide at least one field to update profile" })

    const allowedFields = ["bio", "hourlyRate", "categoryIds"];

    // invalid fields check
    const invalidFields = Object.keys(req.body).filter((key) => !allowedFields.includes(key));

    // error if invalid fields are present
    if (invalidFields.length) return res.status(400).json({ success: false, message: "Invalid fields in request", invalidFields, }); 

    const result = await tutorServices.updateTutorProfile(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error:any) {
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
      message: error.message,
    });
  }
};

const addAvailability = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(403).json({ success: false, message: "Not authenticated", });
    if (req.user.role !== UserRole.TUTOR) return res.status(403).json({ success: false, message: "Only tutors can set availability", }); 
    if (!Object.keys(req.body).length) return res.status(400).json({success: false,message: "Provide required fields",});

    const allowedFields = ["day", "startTime", "endTime"];

    const missingFields = allowedFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) return res.status(400).json({ success: false, message: "Missing required fields", missingFields, });

    // invalid fields check
    const invalidFields = Object.keys(req.body).filter((key) => !allowedFields.includes(key));

    // error if invalid fields are present
    if (invalidFields.length) return res.status(400).json({ success: false, message: "Invalid fields in request", invalidFields, }); 

    const day = req.body.day.toLowerCase();
    const validDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day value",
      });
    }
    
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    const result = await tutorServices.addAvailability(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Availability added successfully",
      data: result,
    });
  } catch (error:any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Availability slot already exists for the specified time",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const tutorController = {
  createTutorProfile,
  updateTutorProfile,
  addAvailability
};