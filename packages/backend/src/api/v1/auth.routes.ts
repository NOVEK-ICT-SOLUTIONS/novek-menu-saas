import { Router } from "express";
import { authController } from "../../modules/auth/auth.controller.ts";
import { validateBody } from "../../core/middleware/validation.middleware.ts";
import { loginSchema, refreshTokenSchema, registerSchema } from "../../modules/auth/auth.validation.ts";
import { authRateLimiter } from "../../core/middleware/rate-limit.middleware.ts";

export const authRouter = Router();

authRouter.use(authRateLimiter);

authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/refresh", validateBody(refreshTokenSchema), authController.refresh);
authRouter.post("/logout", authController.logout);
