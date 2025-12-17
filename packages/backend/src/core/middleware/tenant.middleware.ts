import type { NextFunction, Request, Response } from "express";
import { tenantContext } from "../context/tenant.context.ts";

export const tenantMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return next();
  }

  return tenantContext.runAsync(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    async () => {
      next();
    }
  );
};
