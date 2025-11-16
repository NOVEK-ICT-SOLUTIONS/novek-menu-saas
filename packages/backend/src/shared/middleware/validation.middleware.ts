import { AppError } from "@shared/errors/app-error";
import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export const validate = (schema: z.ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (_error) {
      next(new AppError("Validation failed", 400));
    }
  };
};
