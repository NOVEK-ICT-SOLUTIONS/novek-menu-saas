import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../core/middleware/auth.middleware.ts";
import { tenantMiddleware } from "../../core/middleware/tenant.middleware.ts";
import { validateBody, validateParams } from "../../core/middleware/validation.middleware.ts";
import { commonSchemas } from "../../core/validation/schemas.ts";
import { menuItemsController } from "../../modules/menu-items/menu-items.controller.ts";
import {
  createMenuItemSchema,
  menuItemIdParamSchema,
  updateMenuItemSchema,
} from "../../modules/menu-items/menu-items.validation.ts";

const categoryIdParamSchema = z.object({
  categoryId: commonSchemas.id,
});

export const menuItemsRouter = Router();

menuItemsRouter.use(authMiddleware);
menuItemsRouter.use(tenantMiddleware);

menuItemsRouter.get(
  "/category/:categoryId",
  validateParams(categoryIdParamSchema),
  menuItemsController.getAllByCategory,
);
menuItemsRouter.get("/:id", validateParams(menuItemIdParamSchema), menuItemsController.getById);
menuItemsRouter.post("/", validateBody(createMenuItemSchema), menuItemsController.create);
menuItemsRouter.patch(
  "/:id",
  validateParams(menuItemIdParamSchema),
  validateBody(updateMenuItemSchema),
  menuItemsController.update,
);
menuItemsRouter.delete("/:id", validateParams(menuItemIdParamSchema), menuItemsController.delete);
