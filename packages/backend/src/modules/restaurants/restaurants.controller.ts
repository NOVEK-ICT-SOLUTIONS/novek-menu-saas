import type { NextFunction, Request, Response } from "express";
import { restaurantsService } from "./restaurants.service.ts";
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from "./restaurants.types.ts";

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NO_CONTENT = 204;

export const restaurantsController = {
  getAll: async (_req: Request, res: Response, _next: NextFunction) => {
    const restaurants = await restaurantsService.getAll();

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { restaurants },
    });
  },

  getById: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const restaurant = await restaurantsService.getById(id);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { restaurant },
    });
  },

  getBySlug: async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;
    const restaurant = await restaurantsService.getBySlug(slug);

    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get("user-agent");
    await restaurantsService.trackQrScan(restaurant.id, ipAddress, userAgent);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { restaurant },
    });
  },

  create: async (req: Request, res: Response, _next: NextFunction) => {
    const data: CreateRestaurantRequest = req.body;
    const restaurant = await restaurantsService.create(data);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { restaurant },
    });
  },

  update: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const data: UpdateRestaurantRequest = req.body;
    const restaurant = await restaurantsService.update(id, data);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { restaurant },
    });
  },

  delete: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await restaurantsService.delete(id);

    res.status(HTTP_STATUS_NO_CONTENT).send();
  },

  getStats: async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await restaurantsService.getStats();

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: stats,
    });
  },
};
