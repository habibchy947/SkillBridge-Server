import { Request, Response } from "express";
import { UserRole } from "../../middlewares/auth";
import { bookingService } from "./bookings.services";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { BookingStatus } from "../../../generated/prisma/enums";

// create booking
const createBooking = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        } else if (req.user.role !== UserRole.STUDENT) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized Access",
            });
        }
        const studentId = req.user.id;
        const { sessionTime, availabilityId } = req.body;
        if (!sessionTime) return res.status(400).json({ success: false, message: "SessionTime is required!" });
        if (!availabilityId) return res.status(400).json({ success: false, message: "AvailabilityId is required!" });


        const result = await bookingService.createBooking(studentId, req.body);
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Booking Creation Failed",
            details: error,
        });
    }
};

// get all bookings
const getAllBookings = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        } else if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized Access",
            });
        }
        const status = req.query.status as BookingStatus | undefined;
        // const { search } = req.query;
        // const searchString = typeof search === 'string' ? search : undefined
        const { page, limit, skip, sortOrder, sortBy } = paginationSortingHelper(req.query)

        const result = await bookingService.getAllBookings({ status, page, limit, skip, sortOrder, sortBy });
        return res.status(200).json({
            success: true,
            message: "Booking Fetched successfully",
            data: result,
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Booking Fetched Failed",
            details: error,
        });
    }
};

// get single booking
const getSingleBooking = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        } else if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.STUDENT) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized Access",
            });
        }

        const bookingId = req.params.id;
        if (!bookingId) return res.status(400).json({ success: false, message: "Booking Id is required!" })

        const result = await bookingService.getSingleBooking(bookingId as string, req.user.id, req.user.role);
        return res.status(200).json({
            success: true,
            message: "Booking Fetched successfully",
            data: result,
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Booking Fetched Failed",
            details: error,
        });
    }
}

// get my bookings
const getMyBookings = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        } else if (req.user.role !== UserRole.STUDENT && req.user.role !== UserRole.TUTOR) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized Access",
            });
        }
        const status = req.query.status as BookingStatus | undefined;

        const { page, limit, skip, sortOrder, sortBy } = paginationSortingHelper(req.query)
        const userId = req.user.id
        const result = await bookingService.getMyBookings({ id: userId, status, page, limit, skip, sortOrder, sortBy });
        return res.status(200).json({
            success: true,
            message: "Booking Fetched successfully",
            data: result,
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Booking Fetched Failed",
            details: error,
        });
    }
}

const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(403).json({ success: false, message: "Unauthorized", });
        if (req.user.role !== UserRole.STUDENT && req.user.role !== UserRole.TUTOR) return res.status(403).json({ success: false, message: "Unauthorized Access", });

        const bookingId = req.params.id;
        if (!bookingId) return res.status(403).json({ success: false, message: "Booking Id is required", });

        const { status } = req.body as { status: BookingStatus };
        if (status !== BookingStatus.CANCELLED && status !== BookingStatus.COMPLETED && status !== BookingStatus.CONFIRMED) return res.status(403).json({ success: false, message: "Invalid Status", });

        const allowedFields = ['status'];
        const isValidStatus = Object.keys(req.body).every((field) => allowedFields.includes(field));
        if (!isValidStatus) {
            return res.status(403).json({
                success: false,
                message: "Only status field is allowed to update",
            });
         }

        if(Object.keys(req.body).length === 0) return res.status(403).json({ success: false, message: "At least one field is required to update", });
        
        const result = await bookingService.updateBookingStatus(bookingId as string, status, req.user.id, req.user.role);
        return res.status(200).json({
            success: true,
            message: "Booking Updated successfully",
            data: result,
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Booking Update Failed",
            details: error,
        });
    }
}
export const bookingController = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getMyBookings,
    updateBookingStatus
};