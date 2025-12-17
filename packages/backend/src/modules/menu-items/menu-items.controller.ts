import type { NextFunction, Request, Response } from "express";
import { menuItemsService } from "./menu-items.service.ts";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "./menu-items.types.ts";

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NO_CONTENT = 204;

export const menuItemsController = {
  getAllByCategory: async (req: Request, res: Response, _next: NextFunction) => {
    const { categoryId } = req.params;
    const menuItems = await menuItemsService.getAllByCategory(categoryId);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { menuItems },
    });
  },

  getById: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const menuItem = await menuItemsService.getById(id);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { menuItem },
    });
  },

  create: async (req: Request, res: Response, _next: NextFunction) => {
    const data: CreateMenuItemRequest = req.body;
    const menuItem = await menuItemsService.create(data);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { menuItem },
    });
  },

  update: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const data: UpdateMenuItemRequest = req.body;
    const menuItem = await menuItemsService.update(id, data);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { menuItem },
    });
  },

  delete: async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await menuItemsService.delete(id);

    res.status(HTTP_STATUS_NO_CONTENT).send();
  },
};
