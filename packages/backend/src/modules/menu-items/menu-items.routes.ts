import { MenuItemsController } from "@modules/menu-items/menu-items.controller";
import { MenuItemsRepository } from "@modules/menu-items/menu-items.repository";
import { MenuItemsService } from "@modules/menu-items/menu-items.service";
import { createMenuItemSchema, updateMenuItemSchema } from "@modules/menu-items/menu-items.validation";
import { MenusRepository } from "@modules/menus/menus.repository";
import { RestaurantsRepository } from "@modules/restaurants/restaurants.repository";
import { authMiddleware, requireRole } from "@shared/middleware/auth.middleware";
import { validate } from "@shared/middleware/validation.middleware";
import { Router } from "express";

const menuItemsRepository = new MenuItemsRepository();
const menusRepository = new MenusRepository();
const restaurantsRepository = new RestaurantsRepository();
const menuItemsService = new MenuItemsService(menuItemsRepository, menusRepository, restaurantsRepository);
const menuItemsController = new MenuItemsController(menuItemsService);

export const menuItemsRouter = Router();

menuItemsRouter.use(authMiddleware);
menuItemsRouter.use(requireRole("OWNER", "ADMIN"));

menuItemsRouter.get("/menu/:menuId", menuItemsController.getAll);
menuItemsRouter.get("/:id", menuItemsController.getById);
menuItemsRouter.post("/menu/:menuId", validate(createMenuItemSchema), menuItemsController.create);
menuItemsRouter.patch("/:id", validate(updateMenuItemSchema), menuItemsController.update);
menuItemsRouter.delete("/:id", menuItemsController.delete);
