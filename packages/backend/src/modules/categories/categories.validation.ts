import { z } from "zod";
import { commonSchemas } from "../../core/validation/schemas.ts";

export const createCategorySchema = z.object({
  restaurantId: commonSchemas.id,
  name: commonSchemas.name,
  description: commonSchemas.description,
  sortOrder: commonSchemas.sortOrder,
});

export const updateCategorySchema = z.object({
  name: commonSchemas.name.optional(),
  description: commonSchemas.description,
  sortOrder: commonSchemas.sortOrder.optional(),
  isActive: z.boolean().optional(),
});

export const categoryIdParamSchema = z.object({
  id: commonSchemas.id,
});
