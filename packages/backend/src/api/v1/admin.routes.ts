import { Router } from "express";
import { adminController } from "../../modules/admin/admin.controller.ts";
import { authMiddleware } from "../../core/middleware/auth.middleware.ts";
import { tenantMiddleware } from "../../core/middleware/tenant.middleware.ts";

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(tenantMiddleware);

adminRouter.get("/stats", adminController.getStats);
adminRouter.get("/stats/restaurants", adminController.getRestaurantStats);
adminRouter.get("/users", adminController.getAllUsers);
adminRouter.patch("/users/:userId/role", adminController.updateUserRole);
adminRouter.get("/restaurants", adminController.getAllRestaurants);
adminRouter.get("/restaurants/:restaurantId", adminController.getRestaurantById);
