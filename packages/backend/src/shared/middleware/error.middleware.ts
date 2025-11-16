import { AppError } from "@shared/errors/app-error";
import { logger } from "@shared/utils/logger";
import type { NextFunction, Request, Response } from "express";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`Application Error: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
    });
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  logger.error("Unexpected error:", {
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    status: "error",
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
