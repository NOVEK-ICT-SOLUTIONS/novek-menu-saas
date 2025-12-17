import { z } from "zod";
import { commonSchemas } from "../../core/validation/schemas.ts";

export const createMenuItemSchema = z.object({
  categoryId: commonSchemas.id,
  name: commonSchemas.name,
  description: commonSchemas.description,
  price: commonSchemas.price,
  imageUrl: commonSchemas.url,
  isAvailable: z.boolean().default(true),
  sortOrder: commonSchemas.sortOrder,
});

export const updateMenuItemSchema = z.object({
  name: commonSchemas.name.optional(),
  description: commonSchemas.description,
  price: commonSchemas.price.optional(),
  imageUrl: commonSchemas.url,
  isAvailable: z.boolean().optional(),
  sortOrder: commonSchemas.sortOrder.optional(),
});

export const menuItemIdParamSchema = z.object({
  id: commonSchemas.id,
});
