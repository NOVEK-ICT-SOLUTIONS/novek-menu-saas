import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service.ts";

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;

export const adminController = {
  getAllUsers: async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await adminService.getAllUsers();
    res.status(HTTP_STATUS_OK).json({ success: true, data: { users } });
  },

  getAllRestaurants: async (_req: Request, res: Response, _next: NextFunction) => {
    const restaurants = await adminService.getAllRestaurants();
    res.status(HTTP_STATUS_OK).json({ success: true, data: { restaurants } });
  },

  getRestaurantById: async (req: Request, res: Response, _next: NextFunction) => {
    const { restaurantId } = req.params;
    const restaurant = await adminService.getRestaurantById(restaurantId);
    if (!restaurant) {
      res.status(HTTP_STATUS_NOT_FOUND).json({ success: false, error: { message: "Restaurant not found" } });
      return;
    }
    res.status(HTTP_STATUS_OK).json({ success: true, data: { restaurant } });
  },

  getStats: async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await adminService.getStats();
    res.status(HTTP_STATUS_OK).json({ success: true, data: stats });
  },

  getRestaurantStats: async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await adminService.getRestaurantStats();
    res.status(HTTP_STATUS_OK).json({ success: true, data: stats });
  },

  updateUserRole: async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const { role } = req.body as { role: UserRole };
    const user = await adminService.updateUserRole(userId, role);
    res.status(HTTP_STATUS_OK).json({ success: true, data: { user } });
  },
};
