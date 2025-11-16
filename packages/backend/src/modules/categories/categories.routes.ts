import { CategoriesController } from "@modules/categories/categories.controller";
import { CategoriesRepository } from "@modules/categories/categories.repository";
import { CategoriesService } from "@modules/categories/categories.service";
import { createCategorySchema, updateCategorySchema } from "@modules/categories/categories.validation";
import { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { authMiddleware, requireRole } from "@shared/middleware/auth.middleware";
import { validate } from "@shared/middleware/validation.middleware";
import { Router } from "express";

const categoriesRepository = new CategoriesRepository();
const restaurantsRepository = new RestaurantsRepository();
const categoriesService = new CategoriesService(categoriesRepository, restaurantsRepository);
const categoriesController = new CategoriesController(categoriesService);

export const categoriesRouter = Router();

categoriesRouter.use(authMiddleware);
categoriesRouter.use(requireRole("OWNER", "ADMIN"));

categoriesRouter.get("/restaurant/:restaurantId", categoriesController.getAll);
categoriesRouter.get("/:id", categoriesController.getById);
categoriesRouter.post("/restaurant/:restaurantId", validate(createCategorySchema), categoriesController.create);
categoriesRouter.patch("/:id", validate(updateCategorySchema), categoriesController.update);
categoriesRouter.delete("/:id", categoriesController.delete);
