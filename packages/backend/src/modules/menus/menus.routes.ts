import { MenusController } from "@modules/menus/menus.controller";
import { MenusRepository } from "@modules/menus/menus.repository";
import { MenusService } from "@modules/menus/menus.service";
import { createMenuSchema, updateMenuSchema } from "@modules/menus/menus.validation";
import { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { authMiddleware, requireRole } from "@shared/middleware/auth.middleware";
import { validate } from "@shared/middleware/validation.middleware";
import { Router } from "express";

const menusRepository = new MenusRepository();
const restaurantsRepository = new RestaurantsRepository();
const menusService = new MenusService(menusRepository, restaurantsRepository);
const menusController = new MenusController(menusService);

export const menusRouter = Router();

menusRouter.use(authMiddleware);
menusRouter.use(requireRole("OWNER", "ADMIN"));

menusRouter.get("/restaurant/:restaurantId", menusController.getAll);
menusRouter.get("/:id", menusController.getById);
menusRouter.post("/restaurant/:restaurantId", validate(createMenuSchema), menusController.create);
menusRouter.patch("/:id", validate(updateMenuSchema), menusController.update);
menusRouter.delete("/:id", menusController.delete);
