import type { MenuItemsService } from "@modules/menu-items/menu-items.service";
import type { NextFunction, Request, Response } from "express";

export class MenuItemsController {
  constructor(private menuItemsService: MenuItemsService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { menuId } = req.params;
      const ownerId = req.user?.userId;
      const menuItems = await this.menuItemsService.getAllMenuItems(menuId, ownerId);
      res.status(200).json({ status: "success", data: { menuItems } });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const menuItem = await this.menuItemsService.getMenuItemById(id, ownerId);
      res.status(200).json({ status: "success", data: { menuItem } });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { menuId } = req.params;
      const ownerId = req.user?.userId;
      const menuItem = await this.menuItemsService.createMenuItem(menuId, ownerId, req.body);
      res.status(201).json({ status: "success", data: { menuItem } });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const menuItem = await this.menuItemsService.updateMenuItem(id, ownerId, req.body);
      res.status(200).json({ status: "success", data: { menuItem } });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      await this.menuItemsService.deleteMenuItem(id, ownerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
