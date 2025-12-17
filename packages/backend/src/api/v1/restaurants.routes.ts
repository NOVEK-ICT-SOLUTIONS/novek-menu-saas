import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.ts";
import { tenantMiddleware } from "../../core/middleware/tenant.middleware.ts";
import { validateBody, validateParams } from "../../core/middleware/validation.middleware.ts";
import { restaurantsController } from "../../modules/restaurants/restaurants.controller.ts";
import {
  createRestaurantSchema,
  restaurantIdParamSchema,
  updateRestaurantSchema,
} from "../../modules/restaurants/restaurants.validation.ts";

export const restaurantsRouter = Router();

restaurantsRouter.use(authMiddleware);
restaurantsRouter.use(tenantMiddleware);

restaurantsRouter.get("/stats", restaurantsController.getStats);
restaurantsRouter.get("/", restaurantsController.getAll);
restaurantsRouter.get("/:id", validateParams(restaurantIdParamSchema), restaurantsController.getById);
restaurantsRouter.post("/", validateBody(createRestaurantSchema), restaurantsController.create);
restaurantsRouter.patch(
  "/:id",
  validateParams(restaurantIdParamSchema),
  validateBody(updateRestaurantSchema),
  restaurantsController.update,
);
restaurantsRouter.delete("/:id", validateParams(restaurantIdParamSchema), restaurantsController.delete);
