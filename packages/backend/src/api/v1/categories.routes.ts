import { Router } from "express";
import { categoriesController } from "../../modules/categories/categories.controller.ts";
import { validateBody, validateParams } from "../../core/middleware/validation.middleware.ts";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../modules/categories/categories.validation.ts";
import { authMiddleware } from "../../core/middleware/auth.middleware.ts";
import { tenantMiddleware } from "../../core/middleware/tenant.middleware.ts";
import { commonSchemas } from "../../core/validation/schemas.ts";
import { z } from "zod";

const restaurantIdParamSchema = z.object({
  restaurantId: commonSchemas.id,
});

export const categoriesRouter = Router();

categoriesRouter.use(authMiddleware);
categoriesRouter.use(tenantMiddleware);

categoriesRouter.get("/restaurant/:restaurantId", validateParams(restaurantIdParamSchema), categoriesController.getAll);
categoriesRouter.get("/:id", validateParams(categoryIdParamSchema), categoriesController.getById);
categoriesRouter.post("/", validateBody(createCategorySchema), categoriesController.create);
categoriesRouter.patch("/:id", validateParams(categoryIdParamSchema), validateBody(updateCategorySchema), categoriesController.update);
categoriesRouter.delete("/:id", validateParams(categoryIdParamSchema), categoriesController.delete);
