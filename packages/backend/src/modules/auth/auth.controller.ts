import type { AuthService } from "@modules/auth/auth.service";
import type { LoginRequest, RefreshTokenRequest, RegisterRequest } from "@modules/auth/auth.types";
import type { NextFunction, Request, Response } from "express";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RegisterRequest = req.body;
      const result = await this.authService.register(data);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: LoginRequest = req.body;
      const result = await this.authService.login(data);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;
      const result = await this.authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
