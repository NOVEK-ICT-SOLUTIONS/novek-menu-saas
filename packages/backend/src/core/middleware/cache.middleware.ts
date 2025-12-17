import type { NextFunction, Request, Response } from "express";

const DEFAULT_PUBLIC_CACHE_MAX_AGE_SECONDS = 300;

export const cacheMiddleware = (maxAge = DEFAULT_PUBLIC_CACHE_MAX_AGE_SECONDS) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set({
      "Cache-Control": `public, max-age=${maxAge}`,
      "Vary": "Accept-Encoding",
    });
    next();
  };
};

export const privateCacheMiddleware = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set({
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    next();
  };
};

export const noCacheMiddleware = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set({
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
    });
    next();
  };
};
