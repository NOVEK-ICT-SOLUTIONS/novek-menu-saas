import { RestaurantsController } from "@modules/restaurants/restaurants.controller";
import { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { RestaurantsService } from "@modules/restaurants/restaurants.service";
import { createRestaurantSchema, updateRestaurantSchema } from "@modules/restaurants/restaurants.validation";
import { authMiddleware, requireRole } from "@shared/middleware/auth.middleware";
import { validate } from "@shared/middleware/validation.middleware";
import { Router } from "express";

const restaurantsRepository = new RestaurantsRepository();
const restaurantsService = new RestaurantsService(restaurantsRepository);
const restaurantsController = new RestaurantsController(restaurantsService);

export const restaurantsRouter = Router();

restaurantsRouter.get("/slug/:slug", restaurantsController.getBySlug);

restaurantsRouter.use(authMiddleware);
restaurantsRouter.use(requireRole("OWNER", "ADMIN"));

restaurantsRouter.get("/stats", restaurantsController.getStats);
restaurantsRouter.get("/", restaurantsController.getAll);
restaurantsRouter.get("/:id", restaurantsController.getById);
restaurantsRouter.post("/", validate(createRestaurantSchema), restaurantsController.create);
restaurantsRouter.patch("/:id", validate(updateRestaurantSchema), restaurantsController.update);
restaurantsRouter.delete("/:id", restaurantsController.delete);
