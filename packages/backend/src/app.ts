import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { v1Router } from "./api/v1/router.ts";
import { errorMiddleware } from "./core/middleware/error.middleware.ts";
import { apiRateLimiter } from "./core/middleware/rate-limit.middleware.ts";

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(HTTP_STATUS_OK).json({ success: true, timestamp: new Date().toISOString() });
});

app.use("/api/v1", apiRateLimiter, v1Router);

app.use((_req, res) => {
  res.status(HTTP_STATUS_NOT_FOUND).json({ success: false, error: { message: "Route not found" } });
});

app.use(errorMiddleware);
