import { env } from "@config/env";

export const appConfig = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  corsOrigin: env.CORS_ORIGIN,
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: "15m",
    refreshExpiresIn: "7d",
  },
  qrCode: {
    directory: env.QR_CODE_DIR,
  },
};
