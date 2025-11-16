import type { AuthRepository } from "@modules/auth/auth.repository";
import type { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest } from "@modules/auth/auth.types";
import { AppError } from "@shared/errors/app-error";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@shared/utils/jwt";
import { logAction } from "@shared/utils/log-store";
import { logger } from "@shared/utils/logger";
import { comparePassword, hashPassword } from "@shared/utils/password";

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password } = data;

    logger.info(`Registration attempt for email: ${email}`);

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      logger.warn(`Registration failed: Email already exists - ${email}`);
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.authRepository.createUser(email, hashedPassword);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User registered successfully: ${email}`);

    // Log the registration
    logAction("success", "User Registration", `New user registered: ${email}`, email);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    logger.info(`Login attempt for email: ${email}`);

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      logAction("error", "Login Failed", `Invalid password for user: ${email}`, email);
      throw new AppError("Invalid credentials", 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in successfully: ${email}`);

    // Log the successful login
    logAction("success", "User Login", `User logged in: ${email}`, email);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
    logger.info("Refresh token request");

    const payload = verifyRefreshToken(refreshToken);

    const user = await this.authRepository.findUserById(payload.userId);
    if (!user) {
      logger.warn(`Refresh failed: User not found - ${payload.userId}`);
      throw new AppError("User not found", 404);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Access token refreshed for user: ${user.email}`);

    return { accessToken };
  }
}
