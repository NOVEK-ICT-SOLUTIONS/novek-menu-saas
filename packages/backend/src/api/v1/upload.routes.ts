import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware.ts";
import { deleteFile, extractFilenameFromUrl, getFileUrl, upload } from "../../core/upload/upload.service.ts";

export const uploadRouter = Router();

uploadRouter.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = getFileUrl(req.file.filename, baseUrl);

    res.status(201).json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
      },
    });
  },
);

uploadRouter.delete(
  "/image",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { url } = req.body as { url?: string };

    if (!url) {
      res.status(400).json({
        success: false,
        message: "URL is required",
      });
      return;
    }

    const filename = extractFilenameFromUrl(url);
    if (!filename) {
      res.status(400).json({
        success: false,
        message: "Invalid file URL",
      });
      return;
    }

    await deleteFile(filename);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  },
);
