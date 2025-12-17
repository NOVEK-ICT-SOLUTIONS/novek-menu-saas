import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface FullTokenPayload extends TokenPayload {
  tokenId: string;
}

export const tokenService = {
  generateAccessToken: (payload: TokenPayload): string => {
    const fullPayload: FullTokenPayload = {
      ...payload,
      tokenId: crypto.randomUUID(),
    };
    return jwt.sign(fullPayload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  },

  generateRefreshToken: (payload: TokenPayload): string => {
    const fullPayload: FullTokenPayload = {
      ...payload,
      tokenId: crypto.randomUUID(),
    };
    return jwt.sign(fullPayload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  },

  verifyAccessToken: (token: string): FullTokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as FullTokenPayload;
  },

  verifyRefreshToken: (token: string): FullTokenPayload => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as FullTokenPayload;
  },

  generateTokenPair: (payload: TokenPayload) => {
    return {
      accessToken: tokenService.generateAccessToken(payload),
      refreshToken: tokenService.generateRefreshToken(payload),
    };
  },
};
