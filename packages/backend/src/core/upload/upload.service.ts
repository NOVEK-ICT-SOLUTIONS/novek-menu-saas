import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { unlink } from "fs/promises";
import multer from "multer";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"] as const;

const ensureUploadDir = () => {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

export const getFileUrl = (filename: string, baseUrl: string): string => `${baseUrl}/uploads/${filename}`;

export const deleteFile = async (filename: string): Promise<void> => {
  const filepath = path.join(UPLOAD_DIR, filename);
  if (existsSync(filepath)) {
    await unlink(filepath);
  }
};

export const extractFilenameFromUrl = (url: string): string | null => {
  const match = url.match(/\/uploads\/([^/?]+)/);
  return match ? match[1] : null;
};
