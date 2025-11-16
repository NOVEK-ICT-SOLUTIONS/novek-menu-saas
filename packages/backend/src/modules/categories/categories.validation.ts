import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name too long"),
  sortOrder: z.number().int().min(0, "Sort order must be positive").optional().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name too long").optional(),
  sortOrder: z.number().int().min(0, "Sort order must be positive").optional(),
});
