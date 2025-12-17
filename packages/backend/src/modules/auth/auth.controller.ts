import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service.ts";
import type { LoginRequest, RefreshTokenRequest, RegisterRequest } from "./auth.types.ts";

const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_OK = 200;

export const authController = {
  register: async (req: Request, res: Response, _next: NextFunction) => {
    const data: RegisterRequest = req.body;
    const result = await authService.register(data);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: result,
    });
  },

  login: async (req: Request, res: Response, _next: NextFunction) => {
    const data: LoginRequest = req.body;
    const result = await authService.login(data);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: result,
    });
  },

  refresh: async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken }: RefreshTokenRequest = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: result,
    });
  },

  logout: async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  },
};
