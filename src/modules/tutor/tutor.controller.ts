import { Request, Response } from "express";
import { tutorServices } from "./tutor.services";
import { Prisma } from "../../../generated/prisma/client";
import { UserRole } from "../../middlewares/auth";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

// create tutor profile
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
  } catch (error: any) {
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
// get all tutors
const getAllTutors = async (req: Request, res: Response) => {
  try {
    const minRate = req.query.minRate ? parseInt(req.query.minRate as string, 10) : undefined;
    const maxRate = req.query.maxRate ? parseInt(req.query.maxRate as string, 10) : undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const category = req.query.category as string | undefined;
    const { search } = req.query
    const searchString = typeof search === 'string' ? search : undefined

    const { page, limit, skip, sortOrder, sortBy } = paginationSortingHelper(req.query)
    const result = await tutorServices.getAllTutors({ minRate, maxRate, minRating, category, search: searchString, page, limit, skip, sortOrder, sortBy });
    return res.status(200).json({
      success: true,
      message: result
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// get single tutor
const getSingleTutor = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.id as string
    const result = await tutorServices.getSingleTutor(tutorId);
    return res.status(200).json({
      success: true,
      message: result
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// update tutor profile
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
  } catch (error: any) {
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
// create tutor availability
const addAvailability = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(403).json({ success: false, message: "Not authenticated", });
    if (req.user.role !== UserRole.TUTOR) return res.status(403).json({ success: false, message: "Only tutors can set availability", });
    if (!Object.keys(req.body).length) return res.status(400).json({ success: false, message: "Provide required fields", });

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
  } catch (error: any) {
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

// get tutor availabilitySlots
const getTutorAvailabilitySlots = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { date } = req.query;

    if (!tutorId) {
      return res.status(400).json({ message: "Tutor Id is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    // validate date format
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(date as string)) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const dateString = date as string;
    const selectedDate = new Date(dateString);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    const [year, month, day] = dateString.split("-").map(Number);

    if (
      selectedDate.getUTCFullYear() !== year ||
      selectedDate.getUTCMonth() + 1 !== month ||
      selectedDate.getUTCDate() !== day
    ) {
      return res.status(400).json({
        message: "Invalid calendar date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot book past dates",
      });
    }
    
    const result = await tutorServices.getTutorAvailabilitySlots(tutorId as string, date as string);
    return res.status(200).json({
      success: true,
      message: result
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// update tutor availability
const updateAvailability = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(403).json({ success: false, message: "Not authenticated", });
    if (req.user.role !== UserRole.TUTOR) return res.status(403).json({ success: false, message: "Only tutors can update availability", });
    if (!Object.keys(req.body).length) return res.status(400).json({ success: false, message: "Provide at least one field to update", });

    const availabilityId = req.params.id;
    // check if availabilityId is provided
    if (!availabilityId) {
      return res.status(400).json({
        success: false,
        message: "Availability ID is required",
      });
    }

    const allowedFields = ["day", "startTime", "endTime"];

    // invalid fields check
    const invalidFields = Object.keys(req.body).filter((key) => !allowedFields.includes(key));

    // error if invalid fields are present
    if (invalidFields.length) return res.status(400).json({ success: false, message: "Invalid fields in request", invalidFields, });

    if (req.body.day) {
      const day = req.body.day.toLowerCase();
      // validate day value
      const validDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      if (!validDays.includes(day)) {
        return res.status(400).json({
          success: false,
          message: "Invalid day value",
        });
      }
    }

    if (req.body.startTime || req.body.endTime) {
      const startTime = req.body.startTime;
      const endTime = req.body.endTime;
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

      // validate time format
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: "Time must be in HH:MM format",
        });
      }

      // check if start time is before end time
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: "Start time must be before end time",
        });
      }
    }

    const result = await tutorServices.updateAvailability(req.body, req.user.id, availabilityId as string);
    return res.status(200).json({
      success: true,
      message: "Availability slot updated successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const tutorController = {
  createTutorProfile,
  updateTutorProfile,
  addAvailability,
  updateAvailability,
  getAllTutors,
  getSingleTutor,
  getTutorAvailabilitySlots
};