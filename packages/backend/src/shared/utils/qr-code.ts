import fs from "node:fs/promises";
import path from "node:path";
import { appConfig } from "@config/app.config";
import { logger } from "@shared/utils/logger";
import QRCode from "qrcode";

export const generateQRCode = async (slug: string, restaurantId: string) => {
  try {
    const menuUrl = `${process.env.CORS_ORIGIN || "http://localhost:5173"}/menu/${slug}`;

    const qrDir = appConfig.qrCode.directory;
    await fs.mkdir(qrDir, { recursive: true });

    const fileName = `${restaurantId}-${Date.now()}.png`;
    const filePath = path.join(qrDir, fileName);

    await QRCode.toFile(filePath, menuUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    logger.info(`QR code generated for restaurant ${restaurantId}: ${fileName}`);

    return `/qr-codes/${fileName}`;
  } catch (error) {
    logger.error("QR code generation failed:", error);
    throw error;
  }
};

export const deleteQRCode = async (qrCodeUrl: string) => {
  try {
    const fileName = path.basename(qrCodeUrl);
    const filePath = path.join(appConfig.qrCode.directory, fileName);

    await fs.unlink(filePath);
    logger.info(`QR code deleted: ${fileName}`);
  } catch (error) {
    logger.error("QR code deletion failed:", error);
  }
};
