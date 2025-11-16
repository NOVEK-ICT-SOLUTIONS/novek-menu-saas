import type { AdminService } from "@modules/admin/admin.service";
import type { NextFunction, Request, Response } from "express";

export class AdminController {
  constructor(private adminService: AdminService) {}

  getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.adminService.getAllUsers();
      res.status(200).json({ status: "success", data: { users } });
    } catch (error) {
      next(error);
    }
  };

  getAllRestaurants = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await this.adminService.getAllRestaurants();
      res.status(200).json({ status: "success", data: { restaurants } });
    } catch (error) {
      next(error);
    }
  };

  getRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;
      const restaurant = await this.adminService.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ status: "error", message: "Restaurant not found" });
      }
      res.status(200).json({ status: "success", data: { restaurant } });
    } catch (error) {
      next(error);
    }
  };

  getAllMenus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const menus = await this.adminService.getAllMenus();
      res.status(200).json({ status: "success", data: { menus } });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminService.getStats();
      res.status(200).json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  };

  getRestaurantStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminService.getRestaurantStats();
      res.status(200).json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await this.adminService.updateUserRole(userId, role);
      res.status(200).json({ status: "success", data: { user } });
    } catch (error) {
      next(error);
    }
  };

  getLogs = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await this.adminService.getLogs();
      res.status(200).json({ status: "success", data: { logs } });
    } catch (error) {
      next(error);
    }
  };
}
