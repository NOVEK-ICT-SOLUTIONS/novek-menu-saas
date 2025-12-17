import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

const API_RATE_LIMIT_MAX = 100;
const AUTH_RATE_LIMIT_MAX = 5;
const PUBLIC_RATE_LIMIT_MAX = 60;

const rateLimitMessage = {
  success: false,
  error: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later",
  },
} as const;

const authRateLimitMessage = {
  success: false,
  error: {
    code: "AUTH_RATE_LIMIT",
    message: "Too many login attempts, please try again in 15 minutes",
  },
} as const;

export const apiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: API_RATE_LIMIT_MAX,
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: authRateLimitMessage,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicRateLimiter = rateLimit({
  windowMs: ONE_MINUTE_MS,
  max: PUBLIC_RATE_LIMIT_MAX,
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});
