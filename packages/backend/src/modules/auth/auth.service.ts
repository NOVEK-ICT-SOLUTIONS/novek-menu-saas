import { authRepository } from "./auth.repository.ts";
import type { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest } from "./auth.types.ts";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../core/errors/base.error.ts";
import { tokenService } from "../../core/auth/token.service.ts";
import { passwordService } from "../../core/auth/password.service.ts";

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await passwordService.hash(data.password);
    const user = await authRepository.create(data.email, hashedPassword);

    const tokens = tokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await passwordService.verify(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = tokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  },

  refreshAccessToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const payload = tokenService.verifyRefreshToken(refreshToken);

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    const accessToken = tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  },
};
