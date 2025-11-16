import { errorHandler } from "@shared/middleware/error.middleware";
import { logger, logStream } from "@shared/utils/logger";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

export const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined", { stream: logStream }));
} else {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (_req, res) => {
  logger.info("Health check endpoint called");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

import { adminRouter } from "@modules/admin/admin.routes";
// API Routes
import { authRouter } from "@modules/auth/auth.routes";
import { categoriesRouter } from "@modules/categories/categories.routes";
import { menuItemsRouter } from "@modules/menu-items/menu-items.routes";
import { menusRouter } from "@modules/menus/menus.routes";
import { restaurantsRouter } from "@modules/restaurants/restaurants.routes";

app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/menus", menusRouter);
app.use("/api/menu-items", menuItemsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/admin", adminRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);
