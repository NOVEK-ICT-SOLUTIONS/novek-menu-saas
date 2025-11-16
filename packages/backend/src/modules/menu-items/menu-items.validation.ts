import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isAvailable: z.boolean().optional().default(true),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isAvailable: z.boolean().optional(),
});
