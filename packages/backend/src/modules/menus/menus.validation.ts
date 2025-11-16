import { z } from "zod";

export const createMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required").max(100, "Name too long"),
  isActive: z.boolean().optional().default(true),
});

export const updateMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required").max(100, "Name too long").optional(),
  isActive: z.boolean().optional(),
});
