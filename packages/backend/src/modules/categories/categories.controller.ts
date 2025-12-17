import type { NextFunction, Request, Response } from "express";
import { categoriesService } from "./categories.service.ts";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "./categories.types.ts";

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NO_CONTENT = 204;

export const categoriesController = {
  getAll: async (req: Request, res: Response, _next: NextFunction) => {
    const { restaurantId } = req.params;
    const categories = await categoriesService.getAllByRestaurant(restaurantId);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { categories },
    });
  },

  getById: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const category = await categoriesService.getById(id);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { category },
    });
  },

  create: async (req: Request, res: Response, _next: NextFunction) => {
    const data: CreateCategoryRequest = req.body;
    const category = await categoriesService.create(data);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { category },
    });
  },

  update: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const data: UpdateCategoryRequest = req.body;
    const category = await categoriesService.update(id, data);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { category },
    });
  },

  delete: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await categoriesService.delete(id);

    res.status(HTTP_STATUS_NO_CONTENT).send();
  },
};
