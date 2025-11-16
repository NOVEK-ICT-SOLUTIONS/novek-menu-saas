import { AdminController } from "@modules/admin/admin.controller";
import { AdminRepository } from "@modules/admin/admin.repository";
import { AdminService } from "@modules/admin/admin.service";
import { authMiddleware, requireRole } from "@shared/middleware/auth.middleware";
import { Router } from "express";

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireRole("ADMIN"));

adminRouter.get("/stats", adminController.getStats);
adminRouter.get("/stats/restaurants", adminController.getRestaurantStats);
adminRouter.get("/users", adminController.getAllUsers);
adminRouter.patch("/users/:userId/role", adminController.updateUserRole);
adminRouter.get("/restaurants", adminController.getAllRestaurants);
adminRouter.get("/restaurants/:restaurantId", adminController.getRestaurantById);
adminRouter.get("/menus", adminController.getAllMenus);
adminRouter.get("/logs", adminController.getLogs);
