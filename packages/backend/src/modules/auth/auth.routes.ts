import { AuthController } from "@modules/auth/auth.controller";
import { AuthRepository } from "@modules/auth/auth.repository";
import { AuthService } from "@modules/auth/auth.service";
import { loginSchema, refreshTokenSchema, registerSchema } from "@modules/auth/auth.validation";
import { validate } from "@shared/middleware/validation.middleware";
import { Router } from "express";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/refresh", validate(refreshTokenSchema), authController.refresh);
authRouter.post("/logout", authController.logout);
